import EventEmitter from 'eventemitter3';
import IsEqual from 'lodash-es/isEqual';
import Merge from 'lodash-es/merge';

import MessageClient from 'eon.extension.framework/messaging/client';
import StorageContext from './context';
import {isDefined, isUndefined} from 'eon.extension.framework/core/helpers';


export class Storage extends EventEmitter {
    constructor() {
        super();

        this._entries = {};

        // Retrieve service, and bind to events
        this.messaging = MessageClient.channel('eon.extension').service('storage');
        this.messaging.on('%subscribe', this._onSubscribed.bind(this));
        this.messaging.on('change', this._onChanged.bind(this));
    }

    context(name) {
        return new StorageContext(this, name);
    }

    // region Public Methods

    get(key, options) {
        options = Merge({
            refresh: false,
            type: null
        }, options || {});

        // Return value from cache (if one is available)
        if(!isUndefined(this._entries[key]) && !options.refresh) {
            return Promise.resolve(this._entries[key].value);
        }

        // Request value from broker
        return this.messaging.request(this._getMethodName('get', options.type), { key })
            .then((value) => {
                // Store value in cache (changes will be received via events)
                this._entries[key] = {
                    type: options.type,
                    value
                };

                // Return current value
                return value;
            });
    }

    getBoolean(key) {
        return this.get(key, { type: 'boolean' });
    }

    getFloat(key) {
        return this.get(key, { type: 'float' });
    }

    getInteger(key) {
        return this.get(key, { type: 'integer' });
    }

    getObject(key) {
        return this.get(key, { type: 'object' });
    }

    getString(key) {
        return this.get(key, { type: 'string' });
    }

    put(key, value) {
        return this.messaging.request('put', { key, value });
    }

    putBoolean(key, value) {
        return this.messaging.request('putBoolean', { key, value });
    }

    putFloat(key, value) {
        return this.messaging.request('putFloat', { key, value });
    }

    putInteger(key, value) {
        return this.messaging.request('putInteger', { key, value });
    }

    putObject(key, value) {
        return this.messaging.request('putObject', { key, value });
    }

    putString(key, value) {
        return this.messaging.request('putString', {key, value});
    }

    remove(key) {
        return this.messaging.request('remove', { key });
    }

    refresh() {
        for(let key in this._entries) {
            if(!this._entries.hasOwnProperty(key)) {
                continue;
            }

            let entry = this._entries[key];

            // Ensure type is available
            if(!isDefined(entry.type)) {
                continue;
            }

            // Refresh storage entry
            this.get(key, { type: entry.type, refresh: true }).then((value) => {
                // Ensure value has changed
                if(IsEqual(entry.value, value)) {
                    return;
                }

                // Emit event
                this.emit('change#' + key, { key, value });
            });
        }
    }

    // endregion

    // region Event Listeners

    onChanged(key, callback) {
        return this.on('change#' + key, callback);
    }

    // endregion

    // region Event Handlers

    _onSubscribed() {
        // Refresh cache
        this.refresh();
    }

    _onChanged({key, value}) {
        // Store value in cache
        this._entries[key] = {
            ...(this._entries[key] || {}),
            value
        };

        // Emit event
        this.emit('change#' + key, { key, value });
    }

    // endregion

    // region Private Methods

    _getMethodName(prefix, type) {
        if(!isDefined(type)) {
            return prefix;
        }

        if(type === 'boolean') {
            return prefix + 'Boolean';
        }

        if(type === 'float') {
            return prefix + 'Float';
        }

        if(type === 'integer') {
            return prefix + 'Integer';
        }

        if(type === 'object') {
            return prefix + 'Object';
        }

        if(type === 'string') {
            return prefix + 'String';
        }

        throw new Error('Unknown type: ' + type);
    }

    // endregion
}

export default new Storage();
