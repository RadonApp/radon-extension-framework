import Messaging from 'eon.extension.browser/messaging';

import {isDefined} from 'eon.extension.framework/core/helpers';

import EventEmitter from 'eventemitter3';
import merge from 'lodash-es/merge';

import {
    Models,
    Message,
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
        this.options = merge({
            context: ContextTypes.Content,
            extensionId: null
        }, options);

        // Automatically initialize based on current context
        if(this.options.context === ContextTypes.Background) {
            this.listen();
        }
    }

    // region Connection methods

    connect(channelId, force) {
        force = isDefined(force) ? force : false;

        if(!force && typeof this.connectedChannels[channelId] !== 'undefined') {
            console.log('[%s] Already connected to channel %o', this.channelId, channelId);
            return this;
        }

        // Ignore `connect()` in background contexts
        if(this.options.context === ContextTypes.Background) {
            return this;
        }

        // Ensure "extensionId" is defined in website contexts
        if(this.options.context === ContextTypes.Website && this.options.extensionId === null) {
            throw new Error('"extensionId" is required for website messaging contexts');
        }

        // Try connect to channel
        let port;

        try {
            port = Messaging.connect(this.options.extensionId, {
                name: this.channelId
            });
        } catch(e) {
            throw new Error('Connection failed: ' + e.stack);
        }

        // Connected to correct port
        console.debug('[%s] Connected to channel: %o', this.channelId, channelId);

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
            console.warn('Unable to disconnect channel %o:', channelId, e.stack);
            return false;
        }

        // Remove port reference
        delete this.connectedChannels[channelId];

        console.debug('[%s] Disconnected from channel: %o', this.channelId, channelId);
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

        console.debug('[%s] Waiting for connections...', this.channelId);
    }

    // endregion

    // region Public methods

    // region Broadcast

    broadcast(payload) {
        let message = this._constructMessage(payload, Array.from(arguments).slice(1));

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
        let message = this._constructMessage(payload, Array.from(arguments).slice(2));

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
        let message = this._constructMessage(payload, Array.from(arguments).slice(1));

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
        let message = this._constructMessage(payload, Array.from(arguments).slice(2));

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
        let message = this._constructMessage(payload, Array.from(arguments).slice(2));

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
        let message = this._constructMessage(payload, Array.from(arguments).slice(3));

        // Emit local events
        if(message instanceof EventMessage) {
            this._processEventMessage(this.channelId, message);
        }

        // Send relay request to channel
        return this._sendTo(channelId, new ChannelRelayMessage(targetId, message));
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
        console.log('Sending message to "%s":', channelId, message);
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
            console.log('Sending message to "%s":', channelId, message);
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

        console.warn('[%s] Unknown message received from %o: %O', this.channelId, channelId, message);
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
            console.error('Channel %o is not available, unable to relay message', message.targetId);
            return false;
        }

        // Relay message to target channel
        this._sendTo(message.targetId, message.subject);
        return true;
    }

    _processEventMessage(channelId, message) {
        // Emit "event"
        super.emit('event', message);

        // Emit event identifier
        super.emit.apply(this, [message.id].concat(message.args));
        return true;
    }

    // endregion

    // region Event handlers

    onConnection(port) {
        console.log('[%s] Port connected:', this.channelId, port);

        let onMessage = (data) => {
            // Parse message
            let message = MessageParser.parse(data);

            if(!isDefined(message)) {
                console.warn('[%s] Unable to parse message: %O', this.channelId, data);
                return;
            }

            if(!(message instanceof ChannelConnectMessage)) {
                console.warn('[%s] Received an unexpected message: %O', this.channelId, message);
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

            console.debug('[%s] Channel connected: %o', this.channelId, port.name);
        };

        // Wait for connection request
        port.once('message', onMessage);
    }

    onDisconnect(channelId, port, error) {
        console.debug('[%s] Channel disconnected: %o (error: %o)', this.channelId, channelId, error);

        this.disconnect(channelId);
    }

    onMessage(channelId, data) {
        console.log('Received message from "%s":', channelId, data);

        // Parse message
        let message = MessageParser.parse(data);

        if(!isDefined(message)) {
            console.warn('[%s] Unable to parse message: %O', this.channelId, data);
            return;
        }

        // Process message
        this._process(channelId, message);
    }

    // endregion

    // region Helpers

    _constructMessage(payload, args) {
        if(payload instanceof Message) {
            return payload;
        }

        // Parse event name
        let {resource, name} = this._parseEventName(payload);

        if(resource === null || name === null) {
            throw new Error('Invalid value provided for the "payload" parameter');
        }

        // Construct event message
        return new EventMessage(resource, name, args);
    }

    _parseEventName(event) {
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
