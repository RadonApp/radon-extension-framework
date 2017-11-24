import Item from '../core/base';


export default class Album extends Item {
    static type = 'music/album';

    static children = {
        'artist': 'music/artist'
    };

    constructor(values, children) {
        super(values, {
            artist: null,

            ...(children || {})
        });
    }

    get artist() {
        return this.children.artist;
    }

    set artist(artist) {
        this.children.artist = artist;
    }
}
