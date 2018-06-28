import DefaultsDeep from 'lodash-es/defaultsDeep';
import IsNil from 'lodash-es/isNil';


export default class Property {
    static defaultOptions = {
        key: null,

        deferred: false,
        identifier: false,
        match: false,
        required: false,

        // Handlers
        change: () => true,

        // Document Format
        document: {
            key: null,
            required: true
        }
    };

    constructor(options = null) {
        options = options || {};

        // Parse options
        this.options = DefaultsDeep(options, this.constructor.defaultOptions);
    }

    get deferred() {
        return this.options.deferred;
    }

    get identifier() {
        return this.options.identifier;
    }

    get reference() {
        return false;
    }

    apply(source, target, key, options) {
        throw new Error(this.constructor.name + '.apply(source, target, key, options): Not Implemented');
    }

    copy(source, target, key, options) {
        throw new Error(this.constructor.name + '.copy(source, target, key, options): Not Implemented');
    }

    get(target, key) {
        throw new Error(this.constructor.name + '.get(target, key): Not Implemented');
    }

    set(target, key, value) {
        throw new Error(this.constructor.name + '.set(target, key, value): Not Implemented');
    }

    encode(value, options) {
        return value;
    }

    decode(value, options) {
        return value;
    }

    getOption(format, key, defaultValue) {
        if(!IsNil(this.options[format]) && !IsNil(this.options[format][key])) {
            return this.options[format][key];
        }

        if(!IsNil(this.options[key])) {
            return this.options[key];
        }

        return defaultValue || null;
    }
}
