import Identifier from 'eon.extension.framework/models/identifier';
import {isDefined} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';


export default class MovieIdentifier extends Identifier {
    constructor(keyType, key, title, year) {
        super(keyType, key);

        this.title = title || null;
        this.year = year || null;
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Construct movie identifier
        return new MovieIdentifier(
            data.keyType,
            data.key,

            data.title,
            data.year
        );
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'video/identifier/movie',

            'title': this.title,
            'year': this.year
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
