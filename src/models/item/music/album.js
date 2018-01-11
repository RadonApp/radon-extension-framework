import Item, {Common, Metadata} from '../core/base';


export class AlbumCommon extends Common {
    static Schema = {
        ...Common.Schema,

        title: new Item.Properties.Text({
            change: false,
            identifier: true
        })
    };
}

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
        ...AlbumCommon.Schema
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
        ...AlbumCommon.Schema,

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
