import IsNil from 'lodash-es/isNil';

import ValueProperty from './value';


export default class Reference extends ValueProperty {
    constructor(model, options) {
        super(options);

        this.model = model;
    }

    encode(source, target, key, options) {
        let value = source[key];

        if(IsNil(value) && this.getOption(options.format, 'required', true)) {
            throw new Error(options.item.constructor.name + '.' + key + ' is required');
        }

        if(!this.shouldEncodeValue(value)) {
            return false;
        }

        target[this.getOption(options.format, 'key', key)] = value.toReference();
    }

    shouldEncodeValue(item) {
        return (
            !IsNil(item) &&
            !IsNil(item.id)
        );
    }
}
