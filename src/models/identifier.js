/* eslint-disable no-multi-spaces, key-spacing */
import {isDefined} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';


export const KeyType = {
    Missing:    null,
    Exact:      'exact',
    Generated:  'generated',
    Relation:   'relation',
    Unknown:    'unknown'
};

export default class Identifier {
    constructor(keyType, key) {
        this.keyType = keyType;
        this.key = key;
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Construct identifier
        return new Identifier(
            data.keyType,
            data.key
        );
    }

    dump() {
        return {
            '#type': 'identifier',

            'keyType': this.keyType,
            'key': this.key
        };
    }

    matches(other) {
        if(!isDefined(other)) {
            return false;
        }

        return (
            isEqual(this.keyType, other.keyType) &&
            isEqual(this.key, other.key)
        );
    }
}
