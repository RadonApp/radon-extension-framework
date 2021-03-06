import Item, {Common, Metadata} from '../Core/Base';
import {MediaTypes} from '../../../Core/Enums';


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

    set title(value) {
        this.set('title', value);
    }
}

export default class Artist extends Item {
    static Metadata = ArtistMetadata;
    static Type = MediaTypes.Music.Artist;

    static Schema = {
        ...Item.Schema,
        ...ArtistCommon.Schema
    };

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }
}
