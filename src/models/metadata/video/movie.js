import {Media} from '../core/base';


export default class Movie extends Media {
    constructor(source, id, title, duration) {
        super(source, id, title, duration);
    }

    matches(track) {
        return (
            this.title === track.title
        );
    }
}
