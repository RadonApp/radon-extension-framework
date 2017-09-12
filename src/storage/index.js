import MessageClient from 'eon.extension.framework/messaging/client';
import StorageContext from './context';
import {isUndefined} from 'eon.extension.framework/core/helpers';


export class Storage {
    constructor() {
        this._values = {};

        // Retrieve service, and bind to events
        this.messaging = MessageClient.channel('eon.extension').service('storage');
        this.messaging.on('change', this._onChanged.bind(this));
    }

    context(name) {
        return new StorageContext(this, name);
    }

    get(key) {
        return this._get('get', key);
    }

    getBoolean(key) {
        return this._get('getBoolean', key);
    }

    getFloat(key) {
        return this._get('getFloat', key);
    }

    getInteger(key) {
        return this._get('getInteger', key);
    }

    getObject(key) {
        return this._get('getObject', key);
    }

    getString(key) {
        return this._get('getString', key);
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

    // region Event Listeners

    onChanged(key, callback) {
        return this.messaging.on('change#' + key, callback);
    }

    // endregion

    // region Private Methods

    _get(name, key) {
        // Return value from cache (if one is available)
        if(!isUndefined(this._values[key])) {
            return Promise.resolve(this._values[key]);
        }

        // Request current value
        return this.messaging.request(name, { key }).then((value) => {
            // Store value in cache (changes will be received via events)
            this._values[key] = value;

            // Return current value
            return value;
        });
    }

    _onChanged({key, value}) {
        // Store value in cache
        this._values[key] = value;
    }

    // endregion
}

export default new Storage();
