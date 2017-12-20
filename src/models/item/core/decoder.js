import IsNil from 'lodash-es/isNil';

import {Artist, Album, Track} from '../music';


export default class ItemDecoder {
    static Items = {
        // Music
        'music/artist': Artist,
        'music/album': Album,
        'music/track': Track
    };

    static fromDocument(...args) {
        let { type, value } = ItemDecoder._parseArguments(args);

        if(IsNil(value)) {
            throw new Error('Invalid document');
        }

        if(IsNil(type)) {
            throw new Error('No type available');
        }

        // Retrieve model
        let model = this.get(type);

        if(IsNil(model)) {
            throw new Error('Unknown type: ' + type);
        }

        // Decode document
        return model[type].fromDocument(doc);
    }

    static fromPlainObject(...args) {
        let { type, value } = ItemDecoder._parseArguments(args);

        if(IsNil(value)) {
            throw new Error('Invalid plain object');
        }

        if(IsNil(type)) {
            throw new Error('No type available');
        }

        // Retrieve model
        let model = this.get(type);

        if(IsNil(model)) {
            throw new Error('Unknown type: ' + type);
        }

        // Decode plain object
        return model[type].fromPlainObject(value);
    }

    static get(type) {
        return this.constructor.Items[type] || null;
    }

    static _parseArguments(args) {
        let type, value;

        if(args.length === 1) {
            value = args[0];
        }

        if(args.length === 2) {
            type = args[0];
            value = args[1];
        }

        return {
            type: type || value.type,
            value
        };
    }
}
