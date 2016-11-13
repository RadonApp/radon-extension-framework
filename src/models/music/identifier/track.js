import Identifier from 'eon.extension.framework/models/identifier';
import {dumpModel} from 'eon.extension.framework/models/core/helpers';
import {isDefined, setDefault} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';


export default class TrackIdentifier extends Identifier {
    constructor(keyType, key, artist, album, title) {
        super(keyType, key);

        this.artist = setDefault(artist);
        this.album = setDefault(album);

        this.title = setDefault(title);
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Construct artist identifier
        return new TrackIdentifier(
            data.keyType,
            data.key,

            data.artist,
            data.album,

            data.title
        );
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'music/identifier/track',

            'title': this.title,

            // Children
            '~artist': dumpModel(this.artist),
            '~album': dumpModel(this.album)
        });
    }

    matches(other) {
        return (
            super.matches(other) &&
            isEqual(this.title, other.title) &&

            // Compare artist identifier
            (this.artist === other.artist || (
                isDefined(this.artist) &&
                isDefined(other.artist) &&
                this.artist.matches(other.artist)
            )) &&

            // Compare album identifier
            (this.album === other.album || (
                isDefined(this.album) &&
                isDefined(other.album) &&
                this.album.matches(other.album)
            ))
        );
    }
}
