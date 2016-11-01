import Identifier from 'eon.extension.framework/models/identifier';
import {isDefined} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';


export default class ArtistIdentifier extends Identifier {
    constructor(keyType, key, title) {
        super(keyType, key);

        this.title = title || null;
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Construct artist identifier
        return new ArtistIdentifier(
            data.keyType,
            data.key,

            data.title
        );
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'music/identifier/artist',

            'title': this.title
        });
    }

    matches(other) {
        return (
            super.matches(other) &&
            isEqual(this.title, other.title)
        );
    }
}
