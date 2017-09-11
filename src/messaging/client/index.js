import Messaging from 'eon.extension.browser/messaging';

import EventEmitter from 'eventemitter3';
import IsString from 'lodash-es/isString';
import Uuid from 'uuid';

import Log from 'eon.extension.framework/core/logger';
import MessageClientChannel from './channel';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {parseMessageName} from 'eon.extension.framework/messaging/core/helpers';


export class MessageClient extends EventEmitter {
    constructor(options) {
        super();

        this.id = Uuid.v4();

        this.channels = {};

        this._broker = null;
        this._port = null;

        // Create response handler
        this.responses = new EventEmitter();

        // Bind event handlers
        this.on('receive', this._onMessage.bind(this));

        // Parse options
        options = options || {};

        this.requestTimeout = options.requestTimeout || 9000;
    }

    channel(name) {
        if(!IsString(name)) {
            throw new Error('Invalid value provided for the "name" parameter (expected string)');
        }

        // Create channel (if one doesn't exist)
        if(!isDefined(this.channels[name])) {
            this.channels[name] = new MessageClientChannel(this, name);
        }

        // Return instance
        return this.channels[name];
    }

    service(channel, name) {
        return this.channel(channel).service(name);
    }

    bind(broker) {
        Log.trace('[%s] Bound', this.id);

        this._broker = broker;

        // Emit event
        this.emit('connect', this);
    }

    connect() {
        if(isDefined(this._broker) || isDefined(this._port)) {
            return;
        }

        Log.trace('[%s] Connecting...', this.id);

        try {
            this._port = Messaging.connect({
                name: this.id
            });
        } catch(e) {
            Log.error('[%s] Unable to connect to the message broker: %s', this.id, e.message, e);

            this._port = null;
            return;
        }

        Log.debug('[%s] Connected', this.id);

        // Bind to events
        this._port.on('message', this._onMessage.bind(this));
        this._port.on('disconnect', this._onDisconnected.bind(this));
    }

    request(name, payload) {
        let self = this;
        let id = Uuid.v4();

        // Build request
        let request = {
            type: 'request',
            id,
            name,
            payload
        };

        // Create response promise
        return new Promise(function(resolve, reject) {
            let timeoutId;

            // Bind to response event
            self.responses.once(id, function(response) {
                // Stop timeout callback
                if(isDefined(timeoutId)) {
                    clearTimeout(timeoutId);
                }

                // Reject promise with error (if the request failed)
                if(!response.success) {
                    Log.warn('"%s" request failed: %s', name, response.message);

                    reject(new Error(response.message));
                    return;
                }

                // Resolve promise with result
                resolve(response.result);
            });

            // Start timeout callback
            timeoutId = setTimeout(
                function() {
                    // Remove response event listener
                    self.responses.off(id);

                    // Reject promise with error
                    reject(new Error('Request timeout'));
                },
                self.requestTimeout
            );

            // Send request
            self.send(request);
        });
    }

    send(message) {
        // Emit "post" event
        this.emit('post', message);

        // Ignore port messaging if we are bound directly to the broker
        if(isDefined(this._broker)) {
            return Promise.resolve();
        }

        // Ensure port is connected
        this.connect();

        // Send message over port
        this._port.postMessage(message);

        // Return promise
        return Promise.resolve();
    }

    // region Event Handlers

    _onMessage(message) {
        if(message.type === 'response') {
            this.responses.emit(message.id, message);
        } else if(message.type === 'event') {
            this._onEvent(message);
        } else {
            Log.debug('[%s] Received unknown message: %o', this.id, message);
        }
    }

    _onEvent(message) {
        Log.trace('[%s] Processing event: %s', this.id, message.name);

        // Parse name
        let event = parseMessageName(message.name);

        if(!isDefined(event)) {
            Log.warn('Unable to parse event name: %s', message.name);
            return;
        }

        // Retrieve event target
        let target;

        if(isDefined(event.channel) && isDefined(event.service)) {
            target = this.service(event.channel, event.service);
        } else if(isDefined(event.channel)) {
            target = this.channel(event.channel);
        } else {
            Log.warn('Unsupported event: %s', message.name);
            return;
        }

        // Emit event
        target.emit(event.name, message.payload, {
            broadcast: false
        });
    }

    _onDisconnected(err) {
        Log.debug('[%s] Disconnected', this.id, err);
    }

    // endregion
}

export default new MessageClient();
