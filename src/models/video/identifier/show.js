import Identifier from 'eon.extension.framework/models/identifier';
import {isDefined, setDefault} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';


export default class ShowIdentifier extends Identifier {
    constructor(keyType, key, title, year) {
        super(keyType, key);

        this.title = setDefault(title);
        this.year = setDefault(year);
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Construct show identifier
        return new ShowIdentifier(
            data.keyType,
            data.key,

            data.title,
            data.year
        );
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'video/identifier/show',

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
