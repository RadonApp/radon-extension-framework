import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';

import Identifier from 'eon.extension.framework/models/identifier';


export default class AlbumIdentifier extends Identifier {
    constructor(keyType, key, title) {
        super(keyType, key);

        this.title = title || null;
    }

    dump() {
        return merge(super.dump(), {
            title: this.title
        });
    }

    matches(other) {
        return (
            super.matches(other) &&
            isEqual(this.title, other.title)
        );
    }
}
