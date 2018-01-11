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

    set title(value) {
        this.set('title', value);
    }

    get duration() {
        return this.get('duration');
    }

    set duration(value) {
        this.set('duration', value);
    }

    get number() {
        return this.get('number');
    }

    set number(value) {
        this.set('number', value);
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

    set artist(value) {
        this.set('artist', value);
    }

    get album() {
        return this.get('album');
    }

    set album(value) {
        this.set('album', value);
    }

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }

    get duration() {
        return this.get('duration');
    }

    set duration(value) {
        this.set('duration', value);
    }

    get number() {
        return this.get('number');
    }

    set number(value) {
        this.set('number', value);
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
