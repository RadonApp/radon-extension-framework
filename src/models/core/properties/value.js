import Every from 'lodash-es/every';
import IsNil from 'lodash-es/isNil';

import Property from './core/base';


export default class ValueProperty extends Property {
    constructor(options) {
        super(options);
    }

    apply(source, target, key, options) {
        let value = this.decode(source[this.getOption(options.format, 'key', key)], options);

        if(IsNil(value) || target[key] === value) {
            return false;
        }

        // TODO Validate `value`

        // Change Handler
        if(!IsNil(target[key]) && (this.options.change === false || !this.options.change(target[key], value))) {
            return false;
        }

        // Update value
        target[key] = value;

        return true;
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

        // Set value
        target[this.getOption(options.format, 'key', key)] = encoded;
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

export class Dictionary extends ValueProperty {
    shouldCopyEncodedValue(items) {
        return (
            !IsNil(items) &&
            Object.keys(items).length > 0
        );
    }
}

export class Index extends ValueProperty {
    shouldCopyEncodedValue(items) {
        return (
            !IsNil(items) &&
            Object.keys(items).length > 0 &&
            Every(items, (value) => Object.keys(value).length > 0)
        );
    }
}

export class Integer extends ValueProperty { }

export class Text extends ValueProperty { }
