import Item from '../core/base';


export default class Track extends Item {
    static type = 'music/track';

    static children = {
        'artist': 'music/artist',
        'album': 'music/album'
    };

    static metadata = Item.metadata.concat([
        'number',
        'duration'
    ]);

    constructor(values, children) {
        super({
            number: null,
            duration: null,

            ...(values || {})
        }, {
            artist: null,
            album: null,

            ...(children || {})
        });
    }

    get album() {
        return this.children.album;
    }

    set album(album) {
        this.children.album = album;
    }

    get artist() {
        return this.children.artist;
    }

    set artist(artist) {
        this.children.artist = artist;
    }

    get number() {
        return this.values.number;
    }

    get duration() {
        return this.values.duration;
    }
}
