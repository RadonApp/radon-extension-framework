import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Media} from 'eon.extension.framework/models/metadata';


export default class Track extends Media {
    constructor(source, id, title, artist, album, duration) {
        super(source, id, title, ContentTypes.Music, MediaTypes.Music.Track, duration);

        this.artist = artist || null;
        this.album = album || null;
    }

    dump() {
        let result = super.dump();

        result.artist = this.artist ? this.artist.dump() : null;
        result.album = this.album ? this.album.dump() : null;

        return result;
    }

    matches(track) {
        return (
            this.title === track.title &&
            this.artist.title === track.artist.title &&
            this.album.title === track.album.title
        );
    }
}
