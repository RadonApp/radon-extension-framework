import Identifier from 'eon.extension.framework/models/identifier';
import {isDefined, setDefault} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';


export default class SeasonIdentifier extends Identifier {
    constructor(keyType, key, number) {
        super(keyType, key);

        this.number = setDefault(number);
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Construct season identifier
        return new SeasonIdentifier(
            data.keyType,
            data.key,

            data.number
        );
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'video/identifier/season',

            'number': this.number
        });
    }

    matches(other) {
        return (
            super.matches(other) &&
            isEqual(this.number, other.number)
        );
    }
}
