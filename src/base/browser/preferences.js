export class BrowserPreferencesGroup {
    constructor(preferences, baseKey) {
        this.preferences = preferences;
        this.baseKey = baseKey;
    }

    buildKey(key) {
        return this.baseKey + ':' + key;
    }

    remove(key) {
        return this.preferences.remove(this.buildKey(key));
    }

    // region get

    get(key) {
        return this.preferences.get(this.buildKey(key));
    }

    getBoolean(key) {
        return this.preferences.getBoolean(this.buildKey(key));
    }

    getFloat(key) {
        return this.preferences.getFloat(this.buildKey(key));
    }

    getInt(key) {
        return this.preferences.getInt(this.buildKey(key));
    }

    getObject(key) {
        return this.preferences.getObject(this.buildKey(key));
    }

    getString(key) {
        return this.preferences.getString(this.buildKey(key));
    }

    // endregion

    // region put

    put(key) {
        return this.preferences.put(this.buildKey(key));
    }

    putBoolean(key) {
        return this.preferences.putBoolean(this.buildKey(key));
    }

    putFloat(key) {
        return this.preferences.putFloat(this.buildKey(key));
    }

    putInt(key) {
        return this.preferences.putInt(this.buildKey(key));
    }

    putObject(key) {
        return this.preferences.putObject(this.buildKey(key));
    }

    putString(key) {
        return this.preferences.putString(this.buildKey(key));
    }

    // endregion
}

export default class BrowserPreferences {
    constructor(storage) {
        this._storage = storage;
        this._definitions = {};
    }

    group(key) {
        return new BrowserPreferencesGroup(this, key);
    }

    register(item) {
        // Ensure option/group hasn't already been registered
        if(typeof this._definitions[item.id] !== 'undefined') {
            console.warn('Option %o has already been registered', item.id);
            return;
        }

        // Store reference
        this._definitions[item.id] = item;

        // Process item registration
        if(item.type === 'group') {
            console.debug('Registered preference group: %o', item.id, item);

            // Register group children
            for(let i = 0; i < item.children.length; ++i) {
                this.register(item.children[i]);
            }
        } else {
            console.debug('Registered preference: %o', item.id, item);
        }
    }

    remove(key) {
        return this._storage.remove('preference:' + key);
    }

    // region get

    get(key) {
        // Retrieve option definition
        let definition = this._definitions[key];

        if(typeof definition === 'undefined') {
            return Promise.reject(
                new Error('No preference definition found for: "' + key + '"')
            );
        }

        // Retrieve item from storage
        return this._storage.get('preference:' + key).then((value) => {
            if(value === null) {
                return definition.options.default;
            }

            return value;
        });
    }

    getBoolean(key) {
        // Retrieve option definition
        let definition = this._definitions[key];

        if(typeof definition === 'undefined') {
            return Promise.reject(
                new Error('No preference definition found for: "' + key + '"')
            );
        }

        // Retrieve item from storage
        return this._storage.getBoolean('preference:' + key).then((value) => {
            if(value === null) {
                return definition.options.default;
            }

            return value;
        });
    }

    getFloat(key) {
        // Retrieve option definition
        let definition = this._definitions[key];

        if(typeof definition === 'undefined') {
            return Promise.reject(
                new Error('No preference definition found for: "' + key + '"')
            );
        }

        // Retrieve item from storage
        return this._storage.getFloat('preference:' + key).then((value) => {
            if(value === null) {
                return definition.options.default;
            }

            return value;
        });
    }

    getInt(key) {
        // Retrieve option definition
        let definition = this._definitions[key];

        if(typeof definition === 'undefined') {
            return Promise.reject(
                new Error('No preference definition found for: "' + key + '"')
            );
        }

        // Retrieve item from storage
        return this._storage.getInt('preference:' + key).then((value) => {
            if(value === null) {
                return definition.options.default;
            }

            return value;
        });
    }

    getObject(key) {
        // Retrieve option definition
        let definition = this._definitions[key];

        if(typeof definition === 'undefined') {
            return Promise.reject(
                new Error('No preference definition found for: "' + key + '"')
            );
        }

        // Retrieve item from storage
        return this._storage.getObject('preference:' + key).then((value) => {
            if(value === null) {
                return definition.options.default;
            }

            return value;
        });
    }

    getString(key) {
        // Retrieve option definition
        let definition = this._definitions[key];

        if(typeof definition === 'undefined') {
            return Promise.reject(
                new Error('No preference definition found for: "' + key + '"')
            );
        }

        // Retrieve item from storage
        return this._storage.getString('preference:' + key).then((value) => {
            if(value === null) {
                return definition.options.default;
            }

            return value;
        });
    }

    // endregion

    // region put

    put(key, value) {
        return this._storage.put('preference:' + key, value);
    }

    putBoolean(key, value) {
        return this._storage.putBoolean('preference:' + key, value);
    }

    putFloat(key, value) {
        return this._storage.putFloat('preference:' + key, value);
    }

    putInt(key, value) {
        return this._storage.putInt('preference:' + key, value);
    }

    putObject(key, value) {
        return this._storage.putObject('preference:' + key, value);
    }

    putString(key, value) {
        return this._storage.putString('preference:' + key, value);
    }

    // endregion
}
