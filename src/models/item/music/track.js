import MapKeys from 'lodash-es/mapKeys';
import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';

import Album from 'neon-extension-framework/models/item/music/album';
import Artist from 'neon-extension-framework/models/item/music/artist';
import Item from 'neon-extension-framework/models/item/core/base';
import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Track extends Item {
    constructor(values, children) {
        super('music/track', values, children);
    }

    // region Properties

    get title() {
        return this.values.title || null;
    }

    set title(title) {
        this.values.title = title;
    }

    get number() {
        return this.values.number || null;
    }

    set number(number) {
        this.values.number = number;
    }

    get duration() {
        return this.values.duration || null;
    }

    set duration(duration) {
        this.values.duration = duration;
    }

    get artist() {
        return this._children.artist || null;
    }

    set artist(artist) {
        this._children.artist = artist;

        // Update value
        if(isDefined(artist)) {
            this.values['artist'] = artist.toPlainObject();
        } else {
            this.values['artist'] = null;
        }
    }

    get album() {
        return this._children.album || null;
    }

    set album(album) {
        this._children.album = album;

        // Update value
        if(isDefined(album)) {
            this.values['album'] = album.toPlainObject();
        } else {
            this.values['album'] = null;
        }
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
                keys: {
                    include: ['_id', 'title']
                }
            });
        }

        if(isDefined(this.album)) {
            document['album'] = this.album.toDocument({
                keys: {
                    include: ['_id', 'title']
                }
            });

            if(isDefined(this.album.artist)) {
                document['album']['artist'] = this.album.artist.toDocument({
                    keys: {
                        include: ['_id', 'title']
                    }
                });
            }
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
        if(!isDefined(document) || Object.keys(document).length < 1) {
            return null;
        }

        // Create track
        return new Track(MapKeys(document, (value, key) => {
            if(key === '_id') {
                return 'id';
            }

            if(key === '_rev') {
                return 'revision';
            }

            return key;
        }), {
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
        if(!isDefined(item) || Object.keys(item).length < 1) {
            return null;
        }

        return new Track(item, {
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
