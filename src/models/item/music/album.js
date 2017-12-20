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
            reference: true
        })
    };

    get title() {
        return this.get('title');
    }
}

export default class Album extends Item {
    static Metadata = AlbumMetadata;

    static Schema = {
        ...Item.Schema,
        ...AlbumMetadata.Schema,

        //
        // Children
        //

        artist: new Item.Properties.Reference('music/artist', {
            reference: true
        }),
    };

    get artist() {
        return this.get('artist');
    }

    get title() {
        return this.get('title');
    }
}
