import EventEmitter from 'eventemitter3';
import ForEach from 'lodash-es/forEach';
import IsNil from 'lodash-es/isNil';
import MapValues from 'lodash-es/mapValues';
import Storage from 'wes/storage';

import Log from '../Core/Logger';
import StorageContext from './StorageContext';


export default class StorageArea extends EventEmitter {
    constructor(name) {
        super();

        this.name = name;

        // Retrieve storage area
        this._area = Storage[name];

        if(IsNil(this._area)) {
            throw new Error(`Unknown storage area: ${name}`);
        }

        // Bind to changed event
        if(Storage.$exists() && Storage.$has('onChanged')) {
            Storage.onChanged.addListener(this._onChanged.bind(this));
        }
    }

    context(name) {
        return new StorageContext(this, name);
    }

    // region Public Methods

    get(keys) {
        if(!this._area.$has('get')) {
            return Promise.resolve(null);
        }

        return this._area.get(keys);
    }

    getBoolean(key) {
        return this.getBooleans(key).then((values) => values[key]);
    }

    getBooleans(keys) {
        return this.get(keys).then((values) => MapValues(values, (value) => {
            if(typeof value === 'boolean' || value === null) {
                return value;
            }

            if(value === 'true') {
                return true;
            }

            if(value === 'false') {
                return false;
            }

            Log.warn('Invalid boolean stored (%o), using null instead', value);
            return null;
        }));
    }

    getFloat(key) {
        return this.getFloats(key).then((values) => values[key]);
    }

    getFloats(keys) {
        return this.get(keys).then((values) => MapValues(values, (value) => {
            if(value === null) {
                return value;
            }

            return parseFloat(value);
        }));
    }

    getInteger(key) {
        return this.getIntegers(key).then((values) => values[key]);
    }

    getIntegers(keys) {
        return this.get(keys).then((values) => MapValues(values, (value) => {
            if(value === null) {
                return value;
            }

            return parseInt(value, 10);
        }));
    }

    getObject(key) {
        return this.getObjects(key).then((values) => values[key]);
    }

    getObjects(keys) {
        return this.get(keys).then((values) => MapValues(values, (value) => {
            if(value === null) {
                return value;
            }

            return JSON.parse(value);
        }));
    }

    getString(key) {
        return this.getStrings(key).then((values) => values[key]);
    }

    getStrings(keys) {
        return this.get(keys);
    }

    put(key, value) {
        if(!this._area.$has('set')) {
            return Promise.resolve();
        }

        return this._area.set({
            [key]: value
        });
    }

    putBoolean(key, value) {
        if(value === true) {
            value = 'true';
        } else if(value === false) {
            value = 'false';
        } else {
            Log.warn('Invalid boolean provided (%o), using null instead', value);
            value = null;
        }

        return this.put(key, value);
    }

    putFloat(key, value) {
        if(typeof value === 'number') {
            value = value.toString();
        } else {
            Log.warn('Invalid float provided (%o), using null instead', value);
            value = null;
        }

        return this.put(key, value);
    }

    putInteger(key, value) {
        if(typeof value === 'number') {
            value = value.toString();
        } else {
            Log.warn('Invalid int provided (%o), using null instead', value);
            value = null;
        }

        return this.put(key, value);
    }

    putObject(key, value) {
        if(typeof value === 'object') {
            value = JSON.stringify(value);
        } else {
            Log.warn('Invalid object provided (%O), using null instead', value);
            value = null;
        }

        return this.put(key, value);
    }

    putString(key, value) {
        return this.put(key, value);
    }

    remove(keys) {
        return this._area.remove(keys);
    }

    // endregion

    // region Event Listeners

    onChanged(key, callback) {
        return this.on('change#' + key, callback);
    }

    // endregion

    // region Event Handlers

    _onChanged(changes, area) {
        if(this.name !== area) {
            return;
        }

        // Emit events
        ForEach(changes, (change, key) => {
            this.emit('change#' + key, {
                key,
                value: change.newValue
            });
        });
    }

    // endregion
}
