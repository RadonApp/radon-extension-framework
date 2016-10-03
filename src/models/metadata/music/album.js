import {ContentTypes, MediaTypes} from '../../../core/enums';
import {Metadata} from '../core/base';


export default class Album extends Metadata {
    constructor(source, id, title, artist) {
        super(source, id, title, ContentTypes.Music, MediaTypes.Music.Album);

        this.artist = artist;
    }

    dump() {
        let result = super.dump();

        result.artist = this.artist ? this.artist.dump() : null;

        return result;
    }
}
