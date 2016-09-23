export default class BrowserStorage {
    remove(key) {
        return new Promise(function(resolve, reject) {
            localStorage.removeItem(key);
            resolve();
        });
    }

    // region

    get(key) {
        return new Promise(function(resolve, reject) {
            resolve(localStorage.getItem(key));
        });
    }

    getBoolean(key) {
        return this.get(key).then(function(value) {
            if(typeof value === 'boolean' || value === null) {
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
            if(value === null) {
                return value;
            }

            return parseFloat(value);
        });
    }

    getInt(key) {
        return this.get(key).then(function(value) {
            if(value === null) {
                return value;
            }

            return parseInt(value);
        });
    }

    getObject(key) {
        return this.get(key).then(function(value) {
            if(value === null) {
                return value;
            }

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
