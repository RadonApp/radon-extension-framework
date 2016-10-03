import {ContentTypes, MediaTypes} from '../../../core/enums';
import {Media} from '../core/base';


export default class Movie extends Media {
    constructor(source, id, title, year, duration) {
        super(source, id, title, ContentTypes.Video, MediaTypes.Video.Movie, duration);

        this.year = year;
    }

    dump() {
        let result = super.dump();

        result.year = this.year;

        return result;
    }

    matches(track) {
        return (
            this.title === track.title
        );
    }
}
