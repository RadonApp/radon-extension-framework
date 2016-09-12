import {Media} from '../core/base';


export default class Track extends Media {
    constructor(source, id, title, artist, album, duration) {
        super(source, id, title, duration);

        this.artist = artist || null;
        this.album = album || null;
    }

    matches(track) {
        return (
            this.title === track.title &&
            this.artist.title === track.artist.title &&
            this.album.title === track.album.title
        );
    }
}
