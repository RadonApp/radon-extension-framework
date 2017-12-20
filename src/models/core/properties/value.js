import IsFunction from 'lodash-es/isFunction';
import IsNil from 'lodash-es/isNil';

import Property from './core/base';


export default class ValueProperty extends Property {
    constructor(options) {
        super(options);
    }

    apply(source, target, key, options) {
        let value = this.decode(source[this.getOption(options.format, 'key', key)], options);

        if(IsNil(value) || this.isEqual(target[key], value)) {
            return false;
        }

        // TODO Validate `value`

        // Change Handler
        if(!IsNil(target[key])) {
            if(this.options.change === false) {
                return false;
            }

            if(IsFunction(this.options.change) && !this.options.change(target[key], value)) {
                return false;
            }
        }

        // Update value
        target[key] = this.update(target[key], value);

        return true;
    }

    update(current, value) {
        return value;
    }

    copy(source, target, key, options) {
        let value = source[key];

        if(!this.shouldCopyValue(value)) {
            return false;
        }

        // Encode value
        let encoded = this.encode(value, options);

        if(IsNil(encoded) && this.getOption(options.format, 'required', true)) {
            throw new Error(options.item.constructor.name + '.' + key + ' is required');
        }

        if(!this.shouldCopyEncodedValue(encoded)) {
            return false;
        }

        // Copy value to `target`
        target[this.getOption(options.format, 'key', key)] = encoded;

        return true;
    }

    isEqual(a, b) {
        return a === b;
    }

    shouldCopyValue(value) {
        return !IsNil(value);
    }

    shouldCopyEncodedValue(value) {
        return !IsNil(value);
    }

    get(source, key) {
        let value = source[key];

        // TODO Validate `value`

        if(IsNil(value)) {
            return null;
        }

        return value;
    }
}

export class Integer extends ValueProperty { }

export class Text extends ValueProperty { }
