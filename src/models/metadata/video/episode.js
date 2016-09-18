import {Media} from '../core/base';


export default class Episode extends Media {
    constructor(source, id, title, number, duration, show, season) {
        super(source, id, title, duration);

        this.number = number;

        this.show = show || null;
        this.season = season || null;
    }

    dump() {
        var result = super.dump();
        result.type = 'episode';

        result.number = this.number;

        result.show = this.show ? this.show.dump() : null;
        result.season = this.season ? this.season.dump() : null;

        return result;
    }

    matches(track) {
        return (
            this.title === track.title &&
            this.show.title === track.show.title &&
            this.season.title === track.season.title
        );
    }
}
