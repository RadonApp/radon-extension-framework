import Pick from 'lodash-es/pick';

import Artist from 'eon.extension.framework/models/item/music/artist';
import Item from 'eon.extension.framework/models/item/core/base';
import {isDefined} from 'eon.extension.framework/core/helpers';


export default class Album extends Item {
    constructor(id, options) {
        super(id, 'music/album', options);

        // Define optional properties
        options = options || {};

        this.title = options.title || null;
        this.artist = options.artist || null;
    }

    toDocument(options) {
        options = options || {};

        // Build document
        let document = super.toDocument();

        if(isDefined(this.title)) {
            document['title'] = this.title;
        }

        if(isDefined(this.artist)) {
            document['artist'] = this.artist.toDocument({
                keys: ['_id', 'title']
            });
        }

        // Filter document by "keys"
        if(isDefined(options.keys)) {
            return Pick(document, options.keys);
        }

        return document;
    }

    toPlainObject(options) {
        let result = {
            ...super.toPlainObject(options),

            title: this.title,

            artist: null
        };

        if(isDefined(this.artist)) {
            result['artist'] = this.artist.toPlainObject();
        }

        return result;
    }

    static create(options) {
        return new Album(null, {
            ...options,
            complete: true
        });
    }

    static fromDocument(document) {
        if(!isDefined(document)) {
            return null;
        }

        if(document.type !== 'music/album') {
            throw new Error('Expected "music/album", found "' + document.type + '"');
        }

        return new Album(document['_id'], {
            ...document,

            artist: Artist.fromDocument({
                type: 'music/artist',
                ...document['artist']
            })
        });
    }

    static fromPlainObject(item) {
        if(!isDefined(item)) {
            return null;
        }

        if(item.type !== 'music/album') {
            throw new Error('Expected "music/album", found "' + item.type + '"');
        }

        return new Album(item['id'], {
            ...item,

            artist: Artist.fromPlainObject({
                type: 'music/artist',
                ...item['artist']
            })
        });
    }
}
