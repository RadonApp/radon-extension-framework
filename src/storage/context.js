import IsNil from 'lodash-es/isNil';


export default class StorageContext {
    constructor(storage, name) {
        this.storage = storage;
        this.name = name;

        if(IsNil(this.name)) {
            throw new Error('Invalid value provided for the "name" parameter');
        }

        if(this.name.indexOf(':') !== -1) {
            throw new Error('Context names can\'t contain ":" characters');
        }
    }

    key(key) {
        return this.name + ':' + key;
    }

    get(key) {
        return this.storage.get(this.key(key));
    }

    getBoolean(key) {
        return this.storage.getBoolean(this.key(key));
    }

    getFloat(key) {
        return this.storage.getFloat(this.key(key));
    }

    getInteger(key) {
        return this.storage.getInteger(this.key(key));
    }

    getObject(key) {
        return this.storage.getObject(this.key(key));
    }

    getString(key) {
        return this.storage.getString(this.key(key));
    }

    put(key, value) {
        return this.storage.put(this.key(key), value);
    }

    putBoolean(key, value) {
        return this.storage.putBoolean(this.key(key), value);
    }

    putFloat(key, value) {
        return this.storage.putFloat(this.key(key), value);
    }

    putInteger(key, value) {
        return this.storage.putInteger(this.key(key), value);
    }

    putObject(key, value) {
        return this.storage.putObject(this.key(key), value);
    }

    putString(key, value) {
        return this.storage.putString(this.key(key), value);
    }

    onChanged(key, callback) {
        return this.storage.onChanged(this.key(key), callback);
    }

    remove(key) {
        return this.storage.remove(this.key(key));
    }
}
