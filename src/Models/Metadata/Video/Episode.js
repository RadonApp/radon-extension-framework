import IsNil from 'lodash-es/isNil';

import {MediaTypes} from 'neon-extension-framework/Core/Enums';

import Item, {Common, Metadata} from '../Core/Base';


export class EpisodeCommon extends Common {
    static Schema = {
        ...Common.Schema,

        title: new Item.Properties.Text({
            change: false,
            identifier: true
        }),

        number: new Item.Properties.Integer({
            change: false
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

export class EpisodeMetadata extends Metadata {
    static Apply = {
        ...Metadata.Apply,

        exclude: [
            ...Metadata.Apply.exclude,

            'season'
        ]
    };

    static Schema = {
        ...Metadata.Schema,
        ...EpisodeCommon.Schema
    };

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }

    get number() {
        return this.get('number');
    }

    set number(value) {
        this.set('number', value);
    }

    get duration() {
        return this.get('duration');
    }

    set duration(value) {
        this.set('duration', value);
    }
}

export default class Episode extends Item {
    static Metadata = EpisodeMetadata;
    static Type = MediaTypes.Video.Episode;

    static Schema = {
        ...Item.Schema,
        ...EpisodeCommon.Schema,

        //
        // Children
        //

        season: new Item.Properties.Reference(MediaTypes.Video.Season, {
            identifier: true
        })
    };

    get season() {
        return this.get('season');
    }

    set season(value) {
        this.set('season', value);
    }

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }

    get number() {
        return this.get('number');
    }

    set number(value) {
        this.set('number', value);
    }

    get duration() {
        return this.get('duration');
    }

    set duration(value) {
        this.set('duration', value);
    }

    createSelectors(options) {
        return super.createSelectors({
            children: {
                'season': false
            },

            ...(options || {})
        });
    }
}
