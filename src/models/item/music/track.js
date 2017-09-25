import Pick from 'lodash-es/pick';

import Album from 'neon-extension-framework/models/item/music/album';
import Artist from 'neon-extension-framework/models/item/music/artist';
import Item from 'neon-extension-framework/models/item/core/base';
import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Track extends Item {
    constructor(id, options) {
        super(id, 'music/track', options);

        // Define optional properties
        options = options || {};

        this.title = options.title || null;
        this.number = options.number || null;
        this.duration = options.duration || null;

        this.artist = options.artist || null;
        this.album = options.album || null;
    }

    toDocument(options) {
        options = options || {};

        // Build document
        let document = super.toDocument();

        if(isDefined(this.title)) {
            document['title'] = this.title;
        }

        if(isDefined(this.number)) {
            document['number'] = this.number;
        }

        if(isDefined(this.duration)) {
            document['duration'] = this.duration;
        }

        if(isDefined(this.artist)) {
            document['artist'] = this.artist.toDocument({
                keys: ['_id', 'title']
            });
        }

        if(isDefined(this.album)) {
            document['album'] = this.album.toDocument({
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
            number: this.number,
            duration: this.duration,

            artist: null,
            album: null
        };

        if(isDefined(this.artist)) {
            result['artist'] = this.artist.toPlainObject();
        }

        if(isDefined(this.album)) {
            result['album'] = this.album.toPlainObject();
        }

        return result;
    }

    static create(options) {
        return new Track(null, {
            ...options,
            complete: true
        });
    }

    static fromDocument(document) {
        if(!isDefined(document)) {
            return null;
        }

        if(document.type !== 'music/track') {
            throw new Error('Expected "music/track", found "' + document.type + '"');
        }

        return new Track(document['_id'], {
            ...document,

            artist: Artist.fromDocument({
                type: 'music/artist',
                ...document['artist']
            }),

            album: Album.fromDocument({
                type: 'music/album',
                ...document['album']
            })
        });
    }

    static fromPlainObject(item) {
        if(!isDefined(item)) {
            return null;
        }

        if(item.type !== 'music/track') {
            throw new Error('Expected "music/track", found "' + item.type + '"');
        }

        return new Track(item['id'], {
            ...item,

            artist: Artist.fromPlainObject({
                type: 'music/artist',
                ...item['artist']
            }),

            album: Album.fromPlainObject({
                type: 'music/album',
                ...item['album']
            })
        });
    }
}
