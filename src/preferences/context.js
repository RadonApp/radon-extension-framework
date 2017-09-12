import {isDefined} from 'eon.extension.framework/core/helpers';


export class PreferencesContext {
    constructor(preferences, name) {
        this._preferences = preferences;
        this._name = name;

        if(!isDefined(this._name)) {
            throw new Error('Invalid value provided for the "name" parameter');
        }
    }

    get name() {
        return this._name;
    }

    context(name) {
        return new PreferencesContext(this._preferences, this.key(name));
    }

    exists(key) {
        return this._preferences.exists(this.key(key));
    }

    key(key) {
        return this._name + ':' + key;
    }

    onChanged(key, callback) {
        return this._preferences.onChanged(this.key(key), callback);
    }

    remove(key) {
        return this._preferences.remove(this.key(key));
    }

    // region Get

    get(key) {
        return this._preferences.get(this.key(key));
    }

    getBoolean(key) {
        return this._preferences.getBoolean(this.key(key));
    }

    getFloat(key) {
        return this._preferences.getFloat(this.key(key));
    }

    getInteger(key) {
        return this._preferences.getInteger(this.key(key));
    }

    getObject(key) {
        return this._preferences.getObject(this.key(key));
    }

    getString(key) {
        return this._preferences.getString(this.key(key));
    }

    // endregion

    // region Put

    put(key, value) {
        return this._preferences.put(this.key(key), value);
    }

    putBoolean(key, value) {
        return this._preferences.putBoolean(this.key(key), value);
    }

    putFloat(key, value) {
        return this._preferences.putFloat(this.key(key), value);
    }

    putInteger(key, value) {
        return this._preferences.putInteger(this.key(key), value);
    }

    putObject(key, value) {
        return this._preferences.putObject(this.key(key), value);
    }

    putString(key, value) {
        return this._preferences.putString(this.key(key), value);
    }

    // endregion
}
