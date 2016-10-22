import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';

import Identifier from './base';


export default class SeasonIdentifier extends Identifier {
    constructor(keyType, key, number) {
        super(keyType, key);

        this.number = number || null;
    }

    dump() {
        return merge(super.dump(), {
            number: this.number
        });
    }

    matches(other) {
        return (
            super.matches(other) &&
            isEqual(this.number, other.number)
        );
    }
}
