import {Metadata} from '../core/base';


export default class Album extends Metadata {
    constructor(source, id, title, artist) {
        super(source, id, title);

        this.artist = artist;
    }
}
