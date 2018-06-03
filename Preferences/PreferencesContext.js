import IsNil from 'lodash-es/isNil';
import IsString from 'lodash-es/isString';


export default class PreferencesContext {
    constructor(preferences, name, bucket) {
        this._preferences = preferences;
        this._name = name;
        this._bucket = bucket;

        // Validate "name" parameter
        if(IsNil(this._name) || !IsString(this._name)) {
            throw new Error('Invalid value provided for the "name" parameter');
        }

        // Validate "bucket" parameter
        if(IsNil(this._bucket) || IsString(this._bucket)) {
            throw new Error('Invalid value provided for the "bucket" parameter');
        }
    }

    get bucket() {
        return this._bucket;
    }

    get name() {
        return this._name;
    }

    context(name) {
        return new PreferencesContext(this._preferences, this._name + ':' + name, this.bucket.context(name));
    }

    key(key) {
        return this._name + ':' + encodeURIComponent(key);
    }

    exists(key) {
        return this._preferences.exists(this.key(key));
    }

    onChanged(key, callback, options) {
        return this.bucket.onChanged(key, callback);
    }

    remove(key) {
        return this.bucket.remove(key);
    }

    // region Get

    get(key) {
        // Retrieve preference value from storage
        return this.bucket.get(key).then((value) => {
            if(IsNil(value)) {
                return this._preferences.getDefaultValue(this.key(key));
            }

            return value;
        });
    }

    getBoolean(key) {
        // Retrieve preference value from storage
        return this.bucket.getBoolean(key).then((value) => {
            if(IsNil(value)) {
                return this._preferences.getDefaultValue(this.key(key));
            }

            return value;
        });
    }

    getFloat(key) {
        // Retrieve preference value from storage
        return this.bucket.getFloat(key).then((value) => {
            if(IsNil(value)) {
                return this._preferences.getDefaultValue(this.key(key));
            }

            return value;
        });
    }

    getInteger(key) {
        // Retrieve preference value from storage
        return this.bucket.getInteger(key).then((value) => {
            if(IsNil(value)) {
                return this._preferences.getDefaultValue(this.key(key));
            }

            return value;
        });
    }

    getObject(key) {
        // Retrieve preference value from storage
        return this.bucket.getObject(key).then((value) => {
            if(IsNil(value)) {
                return this._preferences.getDefaultValue(this.key(key));
            }

            return value;
        });
    }

    getString(key) {
        // Retrieve preference value from storage
        return this.bucket.getString(key).then((value) => {
            if(IsNil(value)) {
                return this._preferences.getDefaultValue(this.key(key));
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
}
