import Item, {Common, Metadata} from '../core/base';


export class ArtistCommon extends Common {
    static Schema = {
        ...Common.Schema,

        title: new Item.Properties.Text({
            change: false,
            identifier: true
        })
    };
}

export class ArtistMetadata extends Metadata {
    static Schema = {
        ...Metadata.Schema,
        ...ArtistCommon.Schema
    };

    get title() {
        return this.get('title');
    }
}

export default class Artist extends Item {
    static Metadata = ArtistMetadata;
    static Type = 'music/artist';

    static Schema = {
        ...Item.Schema,
        ...ArtistCommon.Schema
    };

    get title() {
        return this.get('title');
    }
}
