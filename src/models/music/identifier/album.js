import Identifier from 'eon.extension.framework/models/identifier';
import {isDefined, setDefault} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';


export default class AlbumIdentifier extends Identifier {
    constructor(keyType, key, title) {
        super(keyType, key);

        this.title = setDefault(title);
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Construct artist identifier
        return new AlbumIdentifier(
            data.keyType,
            data.key,

            data.title
        );
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'music/identifier/album',

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
