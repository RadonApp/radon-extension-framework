import IsNil from 'lodash-es/isNil';

import Item, {Common, Metadata} from '../core/base';


export class TrackCommon extends Common {
    static Schema = {
        ...Common.Schema,

        title: new Item.Properties.Text({
            change: false,
            identifier: true
        }),

        number: new Item.Properties.Integer({
            change: false,

            document: {
                required: false
            }
        }),

        duration: new Item.Properties.Integer({
            change: (current, value) => {
                if(IsNil(value) || value >= current) {
                    return false;
                }

                if(current - value > 15 * 1000) {
                    return false;
                }

                return true;
            },

            document: {
                required: false
            }
        })
    };
}

export class TrackMetadata extends Metadata {
    static Apply = {
        ...Metadata.Apply,

        exclude: [
            ...Metadata.Apply.exclude,

            'artist',
            'album'
        ]
    };

    static Schema = {
        ...Metadata.Schema,
        ...TrackCommon.Schema
    };

    get title() {
        return this.get('title');
    }

    get duration() {
        return this.get('duration');
    }

    get number() {
        return this.get('number');
    }
}

export default class Track extends Item {
    static Metadata = TrackMetadata;
    static Type = 'music/track';

    static Schema = {
        ...Item.Schema,
        ...TrackCommon.Schema,

        //
        // Children
        //

        artist: new Item.Properties.Reference('music/artist', {
            identifier: true
        }),

        album: new Item.Properties.Reference('music/album', {
            identifier: true
        })
    };

    get artist() {
        return this.get('artist');
    }

    get album() {
        return this.get('album');
    }

    get title() {
        return this.get('title');
    }

    get duration() {
        return this.get('duration');
    }

    get number() {
        return this.get('number');
    }
}
