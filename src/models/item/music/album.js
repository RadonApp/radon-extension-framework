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

    set title(value) {
        this.set('title', value);
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

    set artist(value) {
        this.set('artist', value);
    }

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }

    createSelectors(options) {
        return super.createSelectors({
            children: {
                'artist': true
            },

            ...(options || {})
        })
    }
}
