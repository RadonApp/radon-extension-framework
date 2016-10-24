import {isDefined} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';

import Identifier from 'eon.extension.framework/models/identifier';


export default class TrackIdentifier extends Identifier {
    constructor(keyType, key, artist, album, title) {
        super(keyType, key);

        this.artist = artist || null;
        this.album = album || null;

        this.title = title || null;
    }

    dump() {
        return merge(super.dump(), {
            artist: isDefined(this.artist) ?
                this.artist.dump() :
                null,

            album: isDefined(this.album) ?
                this.album.dump() :
                null,

            title: this.title
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
