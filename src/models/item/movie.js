import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';

import Item from 'neon-extension-framework/models/item/core/base';
import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Movie extends Item {
    constructor(id, values) {
        super(id, 'movie', values);
    }

    // region Properties

    get title() {
        return this.values.title || null;
    }

    set title(title) {
        this.values.title = title;
    }

    get year() {
        return this.values.year || null;
    }

    set year(year) {
        this.values.year = year;
    }

    // endregion

    toDocument(options) {
        options = Merge({
            keys: {}
        }, options || {});

        // Validate options
        if(isDefined(options.keys.include) && isDefined(options.keys.exclude)) {
            throw new Error('Only one key filter should be defined');
        }

        // Build document
        let document = {
            '_id': this.id,
            'type': this.type
        };

        if(isDefined(this.ids)) {
            document['ids'] = this.ids;
        }

        if(isDefined(this.title)) {
            document['title'] = this.title;
        }

        if(isDefined(this.year)) {
            document['year'] = this.year;
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

    static fromDocument(document) {
        if(!isDefined(document)) {
            return null;
        }

        if(document.type !== 'movie') {
            throw new Error();
        }

        return new Movie(document['_id'], {
            ids: document['ids'],
            title: document['title'],
            year: document['year']
        });
    }
}
