import Messaging from 'eon.extension.browser/messaging';
import Log from 'eon.extension.framework/core/logger';
import {isDefined} from 'eon.extension.framework/core/helpers';

import EventEmitter from 'eventemitter3';
import merge from 'lodash-es/merge';

import {
    Models,
    Message,
    RequestMessage,
    ResponseMessage,
    EventMessage,
    ChannelBroadcastMessage,
    ChannelConnectMessage,
    ChannelRelayMessage
} from '../models';

import MessageParser from './parser';


export const ContextTypes = {
    Background: 'background',
    Content: 'content',
    Website: 'website'
};

export default class MessagingBus extends EventEmitter {
    constructor(channelId, options) {
        super();

        this.channelId = channelId;

        this.connectedChannels = {};

        // Set default options
        this._options = merge({
            context: ContextTypes.Content,
            extensionId: null
        }, options);

        // Automatically initialize based on current context
        if(this._options.context === ContextTypes.Background) {
            this.listen();
        }
    }

    // region Connection methods

    connect(channelId, force) {
        force = isDefined(force) ? force : false;

        if(!force && typeof this.connectedChannels[channelId] !== 'undefined') {
            Log.debug('[%s] Already connected to channel %o', this.channelId, channelId);
            return this;
        }

        // Ignore `connect()` in background contexts
        if(this._options.context === ContextTypes.Background) {
            return this;
        }

        // Ensure "extensionId" is defined in website contexts
        if(this._options.context === ContextTypes.Website && this._options.extensionId === null) {
            throw new Error('"extensionId" is required for website messaging contexts');
        }

        // Try connect to channel
        let port;

        try {
            port = Messaging.connect(this._options.extensionId, {
                name: this.channelId
            });
        } catch(e) {
            throw new Error('Connection failed: ' + e.stack);
        }

        // Connected to correct port
        Log.debug('[%s] Connected to channel: %o', this.channelId, channelId);

        // Send channel request metadata
        port.postMessage(new ChannelConnectMessage(channelId).dump());

        // Bind to port events
        port.on('disconnect', (error) => {
            this.onDisconnect(port.name, port, error);
        });

        port.on('message', (data) => {
            this.onMessage(port.name, data);
        });

        // Store `port` reference
        this.connectedChannels[channelId] = port;
        return this;
    }

    disconnect(channelId) {
        // Retrieve matching channel port
        let port = this.connectedChannels[channelId];

        if(typeof port === 'undefined') {
            return true;
        }

        // Disconnect channel
        try {
            port.disconnect();
        } catch(e) {
            Log.warn('Unable to disconnect channel %o:', channelId, e.stack);
            return false;
        }

        // Remove port reference
        delete this.connectedChannels[channelId];

        Log.debug('[%s] Disconnected from channel: %o', this.channelId, channelId);
        return true;
    }

    disconnectAll() {
        let result = {
            success: [],
            failed: []
        };

        Object.keys(this.connectedChannels).forEach((channelId) => {
            if(this.disconnect(channelId)) {
                result.success.push(channelId);
            } else {
                result.failed.push(channelId);
            }
        });

        return result;
    }

    listen() {
        // Bind to runtime connection events
        Messaging.on('connect', (port) =>
            this.onConnection(port)
        );

        Log.debug('[%s] Waiting for connections...', this.channelId);
    }

    // endregion

    // region Public methods

    // region Broadcast

    broadcast(payload) {
        let message = this._constructEvent(payload, Array.from(arguments).slice(1));

        // Emit local events
        if(message instanceof EventMessage) {
            this._processEventMessage(this.channelId, message);
        }

        // Send relay request to all channels
        return this._sendToAll(message);
    }

    broadcastVia(channelId, payload) {
        // Ensure channel exists
        if(typeof this.connectedChannels[channelId] === 'undefined') {
            throw new Error('Channel "' + channelId + '" is not available');
        }

        // Construct message
        let message = this._constructEvent(payload, Array.from(arguments).slice(2));

        // Emit local events
        if(message instanceof EventMessage) {
            this._processEventMessage(this.channelId, message);
        }

        // Send relay request to channel
        return this._sendTo(channelId, message);
    }

    // endregion

    // region Emit

    emit(payload) {
        let message = this._constructEvent(payload, Array.from(arguments).slice(1));

        // Emit local events
        if(message instanceof EventMessage) {
            this._processEventMessage(this.channelId, message);
        }

        // Send relay request to all channels
        return this._sendToAll(message);
    }

    emitTo(channelId, payload) {
        // Ensure channel exists
        if(typeof this.connectedChannels[channelId] === 'undefined') {
            throw new Error('Channel "' + channelId + '" is not available');
        }

        // Construct message
        let message = this._constructEvent(payload, Array.from(arguments).slice(2));

        // Emit local events
        if(message instanceof EventMessage) {
            this._processEventMessage(this.channelId, message);
        }

        // Send relay request to channel
        return this._sendTo(channelId, message);
    }

    // endregion

    // region Relay

    relay(targetId, payload) {
        let message = this._constructEvent(payload, Array.from(arguments).slice(2));

        // Emit local events
        if(message instanceof EventMessage) {
            this._processEventMessage(this.channelId, message);
        }

        // Send relay request to all channels
        return this._sendToAll(new ChannelRelayMessage(targetId, message));
    }

    relayVia(channelId, targetId, payload) {
        // Ensure channel exists
        if(typeof this.connectedChannels[channelId] === 'undefined') {
            throw new Error('Channel "' + channelId + '" is not available');
        }

        // Construct message
        let message = this._constructEvent(payload, Array.from(arguments).slice(3));

        // Emit local events
        if(message instanceof EventMessage) {
            this._processEventMessage(this.channelId, message);
        }

        // Send relay request to channel
        return this._sendTo(channelId, new ChannelRelayMessage(targetId, message));
    }

    // endregion

    // region Request

    request(channelId, key, payload, options) {
        options = merge({
            timeout: 5000
        }, options || {});

        // Ensure channel exists
        if(typeof this.connectedChannels[channelId] === 'undefined') {
            throw new Error('Channel "' + channelId + '" is not available');
        }

        // Parse request name
        let {resource, name} = this._splitName(key);

        if(resource === null || name === null) {
            throw new Error('Invalid value provided for the "key" parameter');
        }

        // Construct message
        let message = new RequestMessage(payload, {
            resource: resource,
            name: name
        });

        // Send request, and await response
        return new Promise((resolve, reject) => {
            let timeoutId = null;

            // Send request to channel
            this._sendTo(channelId, message);

            // Create response callback
            let onResponse = (response) => {
                // Cancel timeout callback
                if(isDefined(timeoutId)) {
                    clearTimeout(timeoutId);
                }

                // Remove listener
                this.removeListener('response:' + message.id, onResponse);

                // Resolve promise
                resolve(response.payload);
            };

            // Bind to message event
            this.on('response:' + message.id, onResponse);

            // Start timeout callback
            timeoutId = setTimeout(() => {
                this.removeListener('response:' + message.id, onResponse);

                reject(new Error('Response timeout, waited ' + options.timeout + 'ms'));
            }, options.timeout);
        });
    }

    // endregion

    // endregion

    // region Send methods

    _sendTo(channelId, message, options) {
        // Send message to specific channel

        if(typeof this.connectedChannels[channelId] === 'undefined') {
            throw new Error('Channel "' + channelId + '" is not available');
        }

        if(!(message instanceof Message)) {
            throw new Error('Invalid value provided for "message", expected an instance of the "Message" model');
        }

        // Send message to channel
        Log.trace('Sending message to "%s":', channelId, message);
        this.connectedChannels[channelId].postMessage(message.dump());
    }

    _sendToAll(message, options) {
        if(!(message instanceof Message)) {
            throw new Error('Invalid value provided for "message", expected an instance of the "Message" model');
        }

        // Set default options
        options = merge({
            exclude: []
        }, options || {});

        // Broadcast message to all connected channels
        Object.keys(this.connectedChannels).forEach((channelId) => {
            if(options.exclude.indexOf(channelId) !== -1) {
                return;
            }

            // Retrieve channel port
            let port = this.connectedChannels[channelId];

            // Send message to port
            Log.trace('Sending message to "%s":', channelId, message);
            port.postMessage(message.dump());
        });
    }

    // endregion

    // region Process methods

    _process(channelId, message) {
        if(message instanceof ChannelBroadcastMessage) {
            return this._processBroadcastMessage(channelId, message);
        }

        if(message instanceof ChannelRelayMessage) {
            return this._processRelayMessage(channelId, message);
        }

        if(message instanceof EventMessage) {
            return this._processEventMessage(channelId, message);
        }

        if(message instanceof RequestMessage) {
            return this._processRequestMessage(channelId, message);
        }

        if(message instanceof ResponseMessage) {
            return this._processResponseMessage(channelId, message);
        }

        Log.warn('[%s] Unknown message received from %o: %O', this.channelId, channelId, message);
        return false;
    }

    _processBroadcastMessage(channelId, message) {
        // Emit local events
        if(message.subject instanceof EventMessage) {
            this._process(channelId, message.subject);
        }

        // Send event to all connected channels
        this._sendToAll(message.subject, {exclude: [channelId]});
        return true;
    }

    _processRelayMessage(channelId, message) {
        if(typeof this.connectedChannels[message.targetId] === 'undefined') {
            Log.error('Channel %o is not available, unable to relay message', message.targetId);
            return false;
        }

        // Relay message to target channel
        this._sendTo(message.targetId, message.subject);
        return true;
    }

    _processEventMessage(channelId, message) {
        // Emit events
        super.emit('event', message);
        super.emit.apply(this, [message.id].concat(message.args));

        return true;
    }

    _processRequestMessage(channelId, request) {
        let responded = false;

        let callback = (data) => {
            if(responded) {
                throw new Error('Response has already been sent');
            }

            responded = true;

            // Construct response message
            let response = new ResponseMessage(request.id, data, {
                resource: request.resource,
                name: request.name
            });

            // Send response back to requesting channel
            this._sendTo(channelId, response);
        };

        // Emit events
        super.emit('request', request.payload, callback);
        super.emit('request:' + request.resource + '.' + request.name, request.payload, callback);

        return true;
    }

    _processResponseMessage(channelId, response) {
        Log.debug('Received response from %o, for request %o', channelId, response.requestId);

        // Emit events
        super.emit('response', response);
        super.emit('response:' + response.requestId, response);

        return true;
    }

    // endregion

    // region Event handlers

    onConnection(port) {
        Log.debug('[%s] Port connected:', this.channelId, port);

        let onMessage = (data) => {
            // Parse message
            let message = MessageParser.parse(data);

            if(!isDefined(message)) {
                Log.warn('[%s] Unable to parse message: %O', this.channelId, data);
                return;
            }

            if(!(message instanceof ChannelConnectMessage)) {
                Log.warn('[%s] Received an unexpected message: %O', this.channelId, message);
                return;
            }

            // Verify connection request matches current channel id
            if(message.channelId !== this.channelId) {
                return;
            }

            // Bind to port events
            port.on('disconnect', (error) => {
                this.onDisconnect(port.name, port, error);
            });

            port.on('message', (data) => {
                this.onMessage(port.name, data);
            });

            // Store `port` reference
            this.connectedChannels[port.name] = port;

            Log.debug('[%s] Channel connected: %o', this.channelId, port.name);
        };

        // Wait for connection request
        port.once('message', onMessage);
    }

    onDisconnect(channelId, port, error) {
        Log.debug('[%s] Channel disconnected: %o (error: %o)', this.channelId, channelId, error);

        this.disconnect(channelId);
    }

    onMessage(channelId, data) {
        Log.trace('Received message from "%s":', channelId, data);

        // Parse message
        let message = MessageParser.parse(data);

        if(!isDefined(message)) {
            Log.warn('[%s] Unable to parse message: %O', this.channelId, data);
            return;
        }

        // Process message
        this._process(channelId, message);
    }

    // endregion

    // region Helpers

    _constructEvent(payload, args) {
        if(payload instanceof Message) {
            return payload;
        }

        // Parse event name
        let {resource, name} = this._splitName(payload);

        if(resource === null || name === null) {
            throw new Error('Invalid value provided for the "payload" parameter');
        }

        // Construct event message
        return new EventMessage(resource, name, args);
    }

    _splitName(event) {
        if(!isDefined(event)) {
            return {
                resource: null,
                name: null
            };
        }

        // Find "." character to split at
        let splitAt = event.indexOf('.');

        if(splitAt === -1) {
            return {
                resource: null,
                name: null
            };
        }

        // Split event into resource and name properties
        return {
            resource: event.substring(0, splitAt),
            name: event.substring(splitAt + 1)
        };
    }

    // endregion
}

MessagingBus.Models = Models;
