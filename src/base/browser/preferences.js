export default class BrowserPreferences {
    constructor() {
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
            for(var i = 0; i < item.children.length; ++i) {
                this.register(item.children[i]);
            }
        } else {
            console.debug('Registered preference: %o', item.id, item);
        }
    }

    remove(key) {
        return new Promise(function(resolve, reject) {
            localStorage.removeItem(key);
            resolve();
        });
    }

    // region get

    get(key) {
        // Retrieve option definition
        var definition = this._definitions[key];

        if(typeof definition === 'undefined') {
            return Promise.reject(
                new Error('No preference definition found for: "' + key + '"')
            );
        }

        // Retrieve item from local storage
        return new Promise(function(resolve, reject) {
            var value = localStorage.getItem(key);

            if(value === null) {
                resolve(definition.options.default);
                return;
            }

            resolve(value);
        });
    }

    getBoolean(key) {
        return this.get(key).then(function(value) {
            if(typeof value === 'boolean') {
                return value;
            }

            if(value === 'true') {
                return true;
            }

            if(value === 'false') {
                return false;
            }

            console.warn('Invalid boolean stored (%o), using null instead', value);
            return null;
        });
    }

    getFloat(key) {
        return this.get(key).then(function(value) {
            return parseFloat(value);
        });
    }

    getInt(key) {
        return this.get(key).then(function(value) {
            return parseInt(value);
        });
    }

    getObject(key) {
        return this.get(key).then(function(value) {
            return JSON.parse(value);
        });
    }

    getString(key) {
        return this.get(key);
    }

    // endregion

    // region put

    put(key, value) {
        return new Promise(function(resolve, reject) {
            localStorage.setItem(key, value);
            resolve();
        });
    }

    putBoolean(key, value) {
        if(value === true) {
            value = 'true';
        } else if(value === false) {
            value = 'false';
        } else {
            console.warn('Invalid boolean provided (%o), using null instead', value);
            value = null;
        }

        return this.put(key, value);
    }

    putFloat(key, value) {
        if(typeof value === 'number') {
            value = value.toString();
        } else {
            console.warn('Invalid float provided (%o), using null instead', value);
            value = null;
        }

        return this.put(key, value);
    }

    putInt(key, value) {
        if(typeof value === 'number') {
            value = value.toString();
        } else {
            console.warn('Invalid int provided (%o), using null instead', value);
            value = null;
        }

        return this.put(key, value);
    }

    putObject(key, value) {
        if(typeof value === 'object') {
            value = JSON.stringify(value);
        } else {
            console.warn('Invalid object provided (%O), using null instead', value);
            value = null;
        }

        return this.put(key, value);
    }

    putString(key, value) {
        return this.put(key, value);
    }

    // endregion
}

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