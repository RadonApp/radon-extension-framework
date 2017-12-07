import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';

import Log from 'neon-extension-framework/core/logger';
import Storage from 'neon-extension-framework/storage';

import {PreferencesContext} from './context';


export class Preferences {
    constructor() {
        this._definitions = {};
        this._pages = {};
    }

    get bucket() {
        return Storage.context('preferences');
    }

    get definitions() {
        return this._definitions;
    }

    get pages() {
        return this._pages;
    }

    context(name) {
        return new PreferencesContext(this, name);
    }

    exists(key) {
        return !IsNil(this._definitions[key]);
    }

    onChanged(key, callback) {
        return this.bucket.onChanged(key, callback);
    }

    remove(key) {
        return this.bucket.remove(key);
    }

    // region Register

    register(item) {
        if(item.type === 'group') {
            return this.registerGroup(item);
        }

        if(item.type === 'page') {
            return this.registerPage(item);
        }

        // Ensure option hasn't already been registered
        if(!IsNil(this._definitions[item.id])) {
            Log.warn('Preference option %o has already been registered', item.id);
            return false;
        }

        // Store option reference
        this._definitions[item.id] = item;

        Log.trace('Registered preference option: %o', item.id, item);
        return true;
    }

    registerGroup(group) {
        Log.trace('Registered preference group: %o', group.id, group);

        // Register children
        for(let i = 0; i < group.children.length; ++i) {
            this.register(group.children[i]);
        }

        return true;
    }

    registerPage(page) {
        // Ensure page group exists
        if(IsNil(this._pages[page.plugin.type])) {
            this._pages[page.plugin.type] = {};
        }

        // Ensure page hasn't already been registered
        if(!IsNil(this._pages[page.plugin.type][page.id])) {
            Log.warn('Preference page %o has already been registered', page.id);
            return false;
        }

        // Store page reference
        this._pages[page.plugin.type][page.id] = page;

        Log.trace('Registered preference page: %o', page.id, page);

        // Register children
        for(let i = 0; i < page.children.length; ++i) {
            this.register(page.children[i]);
        }

        return true;
    }

    // endregion

    // region Get

    get(key) {
        // Retrieve preference value from storage
        return this.bucket.get(key).then((value) => {
            if(value === null) {
                return this._getDefault(key);
            }

            return value;
        });
    }

    getBoolean(key) {
        // Retrieve preference value from storage
        return this.bucket.getBoolean(key).then((value) => {
            if(value === null) {
                return this._getDefault(key);
            }

            return value;
        });
    }

    getFloat(key) {
        // Retrieve preference value from storage
        return this.bucket.getFloat(key).then((value) => {
            if(value === null) {
                return this._getDefault(key);
            }

            return value;
        });
    }

    getInteger(key) {
        // Retrieve preference value from storage
        return this.bucket.getInteger(key).then((value) => {
            if(value === null) {
                return this._getDefault(key);
            }

            return value;
        });
    }

    getObject(key) {
        // Retrieve preference value from storage
        return this.bucket.getObject(key).then((value) => {
            if(value === null) {
                return this._getDefault(key);
            }

            return value;
        });
    }

    getString(key) {
        // Retrieve preference value from storage
        return this.bucket.getString(key).then((value) => {
            if(value === null) {
                return this._getDefault(key);
            }

            return value;
        });
    }

    // endregion

    // region Put

    put(key, value) {
        return this.bucket.put(key, value);
    }

    putBoolean(key, value) {
        return this.bucket.putBoolean(key, value);
    }

    putFloat(key, value) {
        return this.bucket.putFloat(key, value);
    }

    putInteger(key, value) {
        return this.bucket.putInteger(key, value);
    }

    putObject(key, value) {
        return this.bucket.putObject(key, value);
    }

    putString(key, value) {
        return this.bucket.putString(key, value);
    }

    // endregion

    // region Private methods

    _getDefault(key, options) {
        options = Merge({
            timeout: 5000
        }, options);

        return new Promise((resolve, reject) => {
            let deferred = false;

            let get = () => {
                let definition = this._definitions[key];

                if(!IsNil(definition)) {
                    resolve(definition.options.default);
                    return;
                }

                if(deferred) {
                    reject(new Error('Unable to find preference definition for: "' + key + '"'));
                    return;
                }

                // Try retrieve definition again in `options.timeout` milliseconds
                deferred = true;
                setTimeout(get, options.timeout);
            };

            // Get default value
            get();
        });
    }

    // endregion
}

export default new Preferences();
