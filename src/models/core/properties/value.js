import Every from 'lodash-es/every';
import IsNil from 'lodash-es/isNil';

import Property from './core/base';


export default class ValueProperty extends Property {
    constructor(options) {
        super(options);
    }

    encode(source, target, key, options) {
        let value = source[key];

        if(IsNil(value) && this.getOption(options.format, 'required', true)) {
            throw new Error(options.item.constructor.name + '.' + key + ' is required');
        }

        if(!this.shouldEncodeValue(value)) {
            return false;
        }

        target[this.getOption(options.format, 'key', key)] = value;
    }

    shouldEncodeValue(value) {
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

    set(source, target, key, options) {
        let value = source[this.getOption(options.format, 'key', key)];

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
}

export class Dictionary extends ValueProperty {
    shouldEncodeValue(items) {
        return (
            !IsNil(items) &&
            Object.keys(items).length > 0
        );
    }
}

export class Index extends ValueProperty {
    shouldEncodeValue(items) {
        return (
            !IsNil(items) &&
            Object.keys(items).length > 0 &&
            Every(items, (value) => Object.keys(value).length > 0)
        );
    }
}

export class Integer extends ValueProperty { }

export class Text extends ValueProperty { }
