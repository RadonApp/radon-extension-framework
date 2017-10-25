import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';

import Item from 'neon-extension-framework/models/item/core/base';
import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Album extends Item {
    constructor(values, options) {
        super('music/album', values, {
            children: {
                'artist': 'music/artist'
            },

            ...options
        });
    }

    // region Properties

    get title() {
        return this.values.title || null;
    }

    set title(title) {
        this.values.title = title;
    }

    get artist() {
        return this.children.artist || null;
    }

    set artist(artist) {
        this.children.artist = artist;
    }

    // endregion

    matches(other) {
        if(super.matches(other)) {
            return true;
        }

        if(this.title === other.title && this.matchesChildren(other.children)) {
            return true;
        }

        return false;
    }

    toDocument(options) {
        options = Merge({
            keys: {}
        }, options || {});

        // Validate options
        if(isDefined(options.keys.include) && isDefined(options.keys.exclude)) {
            throw new Error('Only one key filter should be defined');
        }

        // Build document
        let document = super.toDocument();

        if(isDefined(this.title)) {
            document['title'] = this.title;
        }

        if(isDefined(this.artist)) {
            document['artist'] = this.artist.toDocument({
                keys: {
                    include: ['_id', 'title']
                }
            });
        }

        // Apply key exclude filter
        if(isDefined(options.keys.exclude)) {
            return Omit(document, options.keys.exclude);
        }

        // Apply key include filter
        if(isDefined(options.keys.include)) {
            return Pick(document, options.keys.include);
        }

        return document;
    }

    static decode(values, options) {
        if(!isDefined(values) || Object.keys(values).length < 1) {
            return null;
        }

        return new Album(values, options);
    }
}
