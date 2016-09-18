import {Media} from '../core/base';


export default class Track extends Media {
    constructor(source, id, title, artist, album, duration) {
        super(source, id, title, duration);

        this.artist = artist || null;
        this.album = album || null;
    }

    dump() {
        var result = super.dump();
        result.type = 'track';

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
