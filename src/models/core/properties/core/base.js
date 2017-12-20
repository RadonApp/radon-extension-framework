import DefaultsDeep from 'lodash-es/defaultsDeep';
import IsNil from 'lodash-es/isNil';


export default class Property {
    constructor(options = null) {
        options = options || {};

        // Parse options
        this.options = DefaultsDeep(options, {
            key: null,

            deferred: false,
            reference: false,
            required: false,

            // Handlers
            change: () => true,

            // Document Format
            document: {
                key: null,
                required: true
            }
        });
    }

    get deferred() {
        return this.options.deferred;
    }

    get reference() {
        return this.options.reference;
    }

    get(target, key) {
        throw new Error(this.constructor.name + '.get(target, key): Not Implemented');
    }

    set(target, key, value) {
        throw new Error(this.constructor.name + '.set(target, key, value): Not Implemented');
    }

    getOption(format, key, defaultValue) {
        if(format === 'document' && !IsNil(this.options[format][key])) {
            return this.options[format][key];
        }

        if(!IsNil(this.options[key])) {
            return this.options[key];
        }

        return defaultValue || null;
    }
}
