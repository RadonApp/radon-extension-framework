import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';

import Identifier from 'eon.extension.framework/models/identifier';


export default class MovieIdentifier extends Identifier {
    constructor(keyType, key, title, year) {
        super(keyType, key);

        this.title = title || null;
        this.year = year || null;
    }

    dump() {
        return merge(super.dump(), {
            title: this.title,
            year: this.year
        });
    }

    matches(other) {
        return (
            super.matches(other) &&
            isEqual(this.title, other.title) &&
            isEqual(this.year, other.year)
        );
    }
}
