import IsFunction from 'lodash-es/isFunction';
import IsNil from 'lodash-es/isNil';

import Property from './Core/Base';


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
        if(!IsNil(target[key]) && !this.shouldChangeValue(target[key], value)) {
            if(this.options.match) {
                let message = `${key}: ${JSON.stringify(value)} doesn't match ${JSON.stringify(target[key])}`;

                if(!IsNil(options.item)) {
                    throw new Error(`${options.item.constructor.name}.${message}`);
                }

                throw new Error(message);
            }

            return false;
        }

        // Update value
        this.set(target, key, value);

        return true;
    }

    update(current, value) {
        return value;
    }

    copy(source, target, key, options) {
        let value = source[key];

        if(!this.shouldCopyValue(value, options)) {
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

    shouldChangeValue(current, value) {
        if(this.options.change === false) {
            return false;
        }

        if(IsFunction(this.options.change) && !this.options.change(current, value)) {
            return false;
        }

        return true;
    }

    shouldCopyValue(value, options) {
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

    set(target, key, value) {
        target[key] = this.update(target[key], value);
    }
}

export class Integer extends ValueProperty { }

export class Text extends ValueProperty { }
