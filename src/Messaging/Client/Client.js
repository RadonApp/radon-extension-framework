import EventEmitter from 'eventemitter3';
import IsNil from 'lodash-es/isNil';
import IsString from 'lodash-es/isString';
import Merge from 'lodash-es/merge';
import Runtime from 'wes/runtime';
import Uuid from 'uuid';

import Log from 'neon-extension-framework/Core/Logger';
import {parseMessageName} from 'neon-extension-framework/Messaging/Helpers';

import MessageClientChannel from './Channel';


export default class MessageClient extends EventEmitter {
    constructor(options) {
        super();

        this.id = Uuid.v4();

        this.channels = {};

        this._broker = null;
        this._port = null;

        this._connecting = null;
        this._connectAttempts = 0;

        this._reconnecting = null;

        // Create response handler
        this.responses = new EventEmitter();

        // Bind event handlers
        this.on('receive', this._onMessage.bind(this));

        // Parse options (and set defaults)
        this.options = Merge({
            connect: {
                attempts: 10,
                interval: 2500
            },

            requestTimeout: 9000
        }, options || {});
    }

    channel(name) {
        if(!IsString(name)) {
            throw new Error('Invalid value provided for the "name" parameter (expected string)');
        }

        // Create channel (if one doesn't exist)
        if(IsNil(this.channels[name])) {
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
        if(!IsNil(this._broker) || !IsNil(this._port)) {
            return Promise.resolve();
        }

        // Return reconnecting promise (if already reconnecting)
        if(!IsNil(this._reconnecting)) {
            return this._reconnecting;
        }

        // Return connecting promise (if already connecting)
        if(!IsNil(this._connecting)) {
            return this._connecting;
        }

        // Connect to broker
        Log.trace('[%s] Connecting...', this.id);

        let promise = this._connecting = this._connectRetry().then(() => {
            Log.debug('[%s] Connected', this.id);

            // Reset state
            this._connecting = null;
        }, (err) => {
            Log.debug('[%s] Connection failed: %s', this.id, err ? err.message : null, err);
            return Promise.reject(err);
        });

        // Return promise
        return promise;
    }

    reconnect() {
        if(!IsNil(this._broker) || !IsNil(this._port)) {
            return Promise.resolve();
        }

        // Return reconnecting promise (if already reconnecting)
        if(!IsNil(this._reconnecting)) {
            return this._reconnecting;
        }

        // Connect to broker
        Log.trace('[%s] Reconnecting...', this.id);

        let promise = this._reconnecting = this._connectRetry().then(() => {
            Log.debug('[%s] Reconnected', this.id);

            // Emit event
            this.emit('reconnect', this);

            // Reset state
            this._reconnecting = null;
        }, (err) => {
            Log.debug('[%s] Reconnection failed: %s', this.id, err.message, err);
        });

        // Return promise
        return promise;
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
                if(!IsNil(timeoutId)) {
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
                self.options.requestTimeout
            );

            // Send request
            self.send(request).catch((err) =>
                reject(err)
            );
        });
    }

    send(message) {
        // Emit "post" event
        this.emit('post', message);

        // Ignore port messaging if we are bound directly to the broker
        if(!IsNil(this._broker)) {
            return Promise.resolve();
        }

        // Ensure client is connected, and send message
        return this.connect().then(() =>
            this._port.postMessage(message)
        );
    }

    // region Private Methods

    _connectRetry() {
        if(IsNil(this.options.connect) || !IsNil(this._broker)) {
            return Promise.reject();
        }

        let self = this;

        return new Promise(function(resolve, reject) {
            // Reset state
            self._connectAttempts = 0;

            // Reconnect function
            function connect() {
                if(self._connectAttempts >= self.options.connect.attempts) {
                    // Reject promise with error
                    reject(new Error('Unable to connect (after ' + self._connectAttempts + ' attempts)'));
                    return;
                }

                // Increment attempts
                self._connectAttempts += 1;

                // Connect to broker
                self._connect().then(function() {
                    // Resolve promise
                    resolve();
                }, (err) => {
                    Log.trace(
                        '[%s] Connection failed: %s (will retry in %dms)',
                        self.id,
                        err && err.message,
                        self.options.connect.interval
                    );

                    // Schedule next connection attempt
                    setTimeout(connect, self.options.connect.interval);
                });
            }

            // Reconnect to broker
            connect();
        });
    }

    _connect() {
        let self = this;
        let port;

        // Connect to broker
        try {
            port = Runtime.connect(Runtime.id, {
                name: this.id
            });
        } catch(e) {
            return Promise.reject(e);
        }

        // Bind to events
        port.onMessage.addListener(self._onMessage.bind(self));
        port.onDisconnect.addListener(self._onDisconnected.bind(self));

        // Update state
        self._port = port;

        // Emit event
        self.emit('connect', self);

        // Resolve promise with port
        return Promise.resolve(port);
    }

    // endregion

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

        if(IsNil(event)) {
            Log.warn('Unable to parse event name: %s', message.name);
            return;
        }

        // Retrieve event target
        let target;

        if(!IsNil(event.channel) && !IsNil(event.service)) {
            target = this.service(event.channel, event.service);
        } else if(!IsNil(event.channel)) {
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

        // Reset state
        this._port = null;

        // Try reconnect to broker (if enabled)
        this.reconnect();
    }

    // endregion
}
