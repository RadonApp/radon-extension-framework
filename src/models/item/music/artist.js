import Item, {Metadata} from '../core/base';


export class ArtistMetadata extends Metadata {
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

export default class Artist extends Item {
    static Metadata = ArtistMetadata;
    static Type = 'music/artist';

    static Schema = {
        ...Item.Schema,
        ...ArtistMetadata.Schema
    };

    get title() {
        return this.get('title');
    }
}
