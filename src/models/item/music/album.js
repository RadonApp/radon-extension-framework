import Item, {Metadata} from '../core/base';


export class AlbumMetadata extends Metadata {
    static Apply = {
        ...Metadata.Apply,

        exclude: [
            ...Metadata.Apply.exclude,

            'artist'
        ]
    };

    static Schema = {
        ...Metadata.Schema,

        title: new Item.Properties.Text({
            change: false,
            identifier: true
        })
    };

    get title() {
        return this.get('title');
    }
}

export default class Album extends Item {
    static Metadata = AlbumMetadata;
    static Type = 'music/album';

    static Schema = {
        ...Item.Schema,
        ...AlbumMetadata.Schema,

        //
        // Children
        //

        artist: new Item.Properties.Reference('music/artist', {
            identifier: true
        })
    };

    get artist() {
        return this.get('artist');
    }

    get title() {
        return this.get('title');
    }
}
