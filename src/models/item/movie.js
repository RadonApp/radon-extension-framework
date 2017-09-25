import Pick from 'lodash-es/pick';

import Item from 'neon-extension-framework/models/item/core/base';
import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Movie extends Item {
    constructor(id, options) {
        super(id, 'movie', options);

        // Define optional properties
        options = options || {};

        this.title = options.title || null;
        this.year = options.year || null;
    }

    toDocument(options) {
        options = options || {};

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

        // Filter document by "keys"
        if(isDefined(options.keys)) {
            return Pick(document, options.keys);
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
