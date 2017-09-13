import Item from 'eon.extension.framework/models/item/core/base';
import {isDefined} from 'eon.extension.framework/core/helpers';

import Pick from 'lodash-es/pick';


export default class Artist extends Item {
    constructor(id, options) {
        super(id, 'music/artist', options);

        // Define optional properties
        options = options || {};

        this.title = options.title || null;
    }

    toDocument(options) {
        options = options || {};

        // Build document
        let document = super.toDocument();

        if(isDefined(this.title)) {
            document['title'] = this.title;
        }

        // Filter document by "keys"
        if(isDefined(options.keys)) {
            return Pick(document, options.keys);
        }

        return document;
    }

    toPlainObject(options) {
        return {
            ...super.toPlainObject(options),

            title: this.title
        };
    }

    static create(options) {
        return new Artist(null, {
            ...options,
            complete: true
        });
    }

    static fromDocument(document) {
        if(!isDefined(document)) {
            return null;
        }

        if(document.type !== 'music/artist') {
            throw new Error('Expected "music/artist", found "' + document.type + '"');
        }

        return new Artist(document['_id'], document);
    }

    static fromPlainObject(item) {
        if(!isDefined(item)) {
            return null;
        }

        if(item.type !== 'music/artist') {
            throw new Error('Expected "music/artist", found "' + item.type + '"');
        }

        return new Artist(item['id'], item);
    }
}
