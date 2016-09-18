import {Metadata} from '../core/base';


export default class Album extends Metadata {
    constructor(source, id, title, artist) {
        super(source, id, title);

        this.artist = artist;
    }

    dump() {
        var result = super.dump();
        result.type = 'album';

        result.artist = this.artist ? this.artist.dump() : null;

        return result;
    }
}
