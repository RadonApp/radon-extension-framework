import EventEmitter from 'eventemitter3';
import Merge from 'lodash-es/merge';

import Log from 'eon.extension.framework/core/logger';
import {isDefined} from 'eon.extension.framework/core/helpers';


export default class MessageClientService extends EventEmitter {
    constructor(channel, name) {
        super();

        this.channel = channel;
        this.name = name;

        this.subscribed = false;
        this.subscribing = null;

        // Bind to events
        this.client.on('reconnect', this._onClientReconnected.bind(this));
    }

    get client() {
        return this.channel.client;
    }

    // region Public Methods

    emit(name, payload, options) {
        options = Merge({
            broadcast: true,
            local: true
        }, options || {});

        // Ensure we have joined the channel
        return this.channel.join()
            // Ensure we have subscribed to the service
            .then(() => this.subscribe())
            // Emit event
            .then(() => {
                // Emit event locally
                if(options.local) {
                    super.emit(name, payload);
                }

                // Broadcast event to other clients (via the message broker)
                if(options.broadcast) {
                    return this.client.send({
                        type: 'event',
                        name: this.channel.name + '/' + this.name + '/' + name,
                        payload
                    });
                }

                return Promise.resolve();
            });
    }

    request(name, payload) {
        return this.subscribe().then(() =>
            this.channel.request(this.name + '/' + name, payload)
        );
    }

    subscribe(options) {
        options = Merge({
            force: false
        }, options || options);

        // Ensure we aren't already subscribed
        if(this.subscribed && !options.force) {
            return Promise.resolve();
        }

        // Subscribe to service
        if(!isDefined(this.subscribing)) {
            this.subscribing = this._subscribe();
        }

        return this.subscribing;
    }

    unsubscribe(options) {
        options = Merge({
            force: false
        }, options || options);

        // Ensure we are subscribed
        if(!this.subscribed && !options.force) {
            return Promise.resolve();
        }

        // Unsubscribe from service
        return this._unsubscribe();
    }

    close() {
        return this.unsubscribe();
    }

    // endregion

    // region Private Methods

    _subscribe() {
        return this.client.request('subscribe', {
            channel: this.channel.name,
            service: this.name
        }).then(() => {
            Log.trace('[%s] Subscribed to the "%s/%s" service', this.client.id, this.channel.name, this.name);

            // Emit event
            super.emit('%subscribe');

            // Update state
            this.subscribed = true;
            this.subscribing = null;
        }, (err) => {
            Log.warn(
                '[%s] Unable to subscribe to the "%s/%s" service: %s',
                this.client.id, this.channel.name, this.name,
                err ? err.message : null
            );

            // Update state
            this.subscribing = null;

            // Reject promise with error
            return Promise.reject(new Error(
                'Unable to subscribe to the "' + this.channel.name + '/' + this.name + '" service: ' +
                (err ? err.message : null)
            ));
        });
    }

    _unsubscribe() {
        return this.client.request('unsubscribe', {
            channel: this.channel.name,
            service: this.name
        }).then(() => {
            Log.trace('[%s] Un-subscribed from the "%s/%s" service', this.client.id, this.channel.name, this.name);

            // Emit event
            super.emit('%unsubscribe');

            // Update state
            this.subscribed = false;
        }, (err) => {
            Log.warn(
                '[%s] Unable to un-subscribe from the "%s/%s" service: %s',
                this.client.id, this.channel.name, this.name, err.message
            );

            // Reject promise with error
            return Promise.reject(new Error(
                'Unable to un-subscribe from the "' + this.channel.name + '/' + this.name + '" service: ' + err.message
            ));
        });
    }

    // endregion

    // region Event Handlers

    _onClientReconnected() {
        // Re-subscribe to service on reconnection
        if(this.subscribed) {
            this.subscribe({
                force: true
            });
        }
    }

    // endregion
}
