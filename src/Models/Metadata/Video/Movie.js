import IsNil from 'lodash-es/isNil';

import {MediaTypes} from 'neon-extension-framework/Core/Enums';

import Item, {Common, Metadata} from '../Core/Base';


export class MovieCommon extends Common {
    static Schema = {
        ...Common.Schema,

        title: new Item.Properties.Text({
            change: false,
            identifier: true
        }),

        year: new Item.Properties.Number({
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

export class MovieMetadata extends Metadata {
    static Schema = {
        ...Metadata.Schema,
        ...MovieCommon.Schema
    };

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }

    get year() {
        return this.get('year');
    }

    set year(value) {
        this.set('year', value);
    }

    get duration() {
        return this.get('duration');
    }

    set duration(value) {
        this.set('duration', value);
    }
}

export default class Movie extends Item {
    static Metadata = MovieMetadata;
    static Type = MediaTypes.Video.Movie;

    static Schema = {
        ...Item.Schema,
        ...MovieCommon.Schema
    };

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }

    get year() {
        return this.get('year');
    }

    set year(value) {
        this.set('year', value);
    }

    get duration() {
        return this.get('duration');
    }

    set duration(value) {
        this.set('duration', value);
    }
}
