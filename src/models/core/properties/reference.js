import IsNil from 'lodash-es/isNil';

import ValueProperty from './value';
import {BaseModel} from '../base';


export default class Reference extends ValueProperty {
    static defaultOptions = {
        ...ValueProperty.defaultOptions,

        referenceFormats: ['document']
    };

    get reference() {
        return true;
    }

    constructor(model, options) {
        super(options);

        this.model = model;
    }

    encode(value, options) {
        if(this.options.referenceFormats.indexOf(options.format) >= 0) {
            return value.toReference({
                exclude: ['type']
            });
        }

        if(options.format === 'document') {
            return value.toDocument();
        }

        if(IsNil(options.format) || options.format === 'plain') {
            return value.toPlainObject();
        }

        throw new Error('Unsupported format: ' + options.format);
    }

    decode(value, options) {
        if(IsNil(value) || value instanceof BaseModel) {
            return value;
        }

        if(IsNil(options.decoder)) {
            throw new Error('Decoder required for children');
        }

        if(options.format === 'document') {
            return options.decoder.fromDocument({
                type: this.model,
                ...value
            });
        }

        if(IsNil(options.format) || options.format === 'plain') {
            return options.decoder.fromPlainObject({
                type: this.model,
                ...value
            });
        }

        throw new Error('Unsupported format: ' + options.format);
    }

    shouldCopyValue(item, options) {
        if(IsNil(item)) {
            return false;
        }

        if(options.format === 'document' && IsNil(item.id)) {
            return false;
        }

        return true;
    }
}
