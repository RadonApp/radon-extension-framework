import EventEmitter from 'eventemitter3';
import Merge from 'lodash-es/merge';

import Log from 'neon-extension-framework/core/logger';
import {isDefined} from 'neon-extension-framework/core/helpers';

import MessageClientService from './service';


export default class MessageClientChannel extends EventEmitter {
    constructor(client, name) {
        super();

        this.client = client;
        this.name = name;

        this.joined = false;
        this.joining = null;

        this.services = {};

        // Bind to events
        this.client.on('reconnect', this._onClientReconnected.bind(this));
    }

    service(name) {
        // Create service (if one doesn't exist)
        if(!isDefined(this.services[name])) {
            this.services[name] = new MessageClientService(this, name);
        }

        // Return channel instance
        return this.services[name];
    }

    // region Public Methods

    emit(name, payload, options) {
        options = Merge({
            broadcast: true,
            local: true
        }, options || {});

        // Ensure we are subscribed to the service
        return this.join().then(() => {
            // Emit event locally
            if(options.local) {
                super.emit(name, payload);
            }

            // Broadcast event to other clients (via the message broker)
            if(options.broadcast) {
                return this.client.send({
                    type: 'event',
                    name: this.name + '/' + name,
                    payload
                });
            }

            return Promise.resolve();
        });
    }

    join(options) {
        options = Merge({
            force: false
        }, options || options);

        // Ensure we haven't already joined the channel
        if(this.joined && !options.force) {
            return Promise.resolve();
        }

        // Join channel
        if(!isDefined(this.joining)) {
            this.joining = this._join();
        }

        return this.joining;
    }

    leave(options) {
        options = Merge({
            force: false
        }, options || options);

        // Ensure we have joined the channel
        if(!this.joined && !options.force) {
            return Promise.resolve();
        }

        // Leave channel
        return this._leave();
    }

    request(name, payload) {
        return this.join().then(() =>
            this.client.request(this.name + '/' + name, payload)
        );
    }

    close() {
        return this.leave();
    }

    // endregion

    // region Private Methods

    _join() {
        return this.client.request('join', {
            channel: this.name
        }).then(() => {
            Log.trace('[%s] Joined the "%s" channel', this.client.id, this.name);

            // Emit event
            super.emit('%join');

            // Update state
            this.joined = true;
            this.joining = null;
        }, (err) => {
            Log.warn('[%s] Unable to join the "%s" channel: %s', this.client.id, this.name, err.message);

            // Update state
            this.joining = null;

            // Reject promise with error
            return Promise.reject(new Error('Unable to join the "' + this.name + '" channel: ' + err.message));
        });
    }

    _leave() {
        return this.client.request('leave', {
            channel: this.name
        }).then(() => {
            Log.trace('[%s] Left the "%s" channel', this.client.id, this.name);

            // Emit event
            super.emit('%leave');

            // Update state
            this.joined = false;
        }, (err) => {
            Log.warn('[%s] Unable to leave the "%s" channel: %s', this.client.id, this.name, err.message);

            // Reject promise with error
            return Promise.reject(new Error('Unable to leave the "' + this.name + '" channel: ' + err.message));
        });
    }

    // endregion

    // region Event Handlers

    _onClientReconnected() {
        // Re-join channel on reconnection
        if(this.joined) {
            this.join({
                force: true
            });
        }
    }

    // endregion
}
