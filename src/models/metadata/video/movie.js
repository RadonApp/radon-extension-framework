import {Media} from '../core/base';


export default class Movie extends Media {
    constructor(source, id, title, year, duration) {
        super(source, id, title, duration);

        this.year = year;
    }

    dump() {
        var result = super.dump();
        result.type = 'movie';

        result.year = this.year;

        return result;
    }

    matches(track) {
        return (
            this.title === track.title
        );
    }
}
