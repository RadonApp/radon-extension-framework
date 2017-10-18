import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';

import Item from 'neon-extension-framework/models/item/core/base';
import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Track extends Item {
    constructor(values, options) {
        super('music/track', values, {
            children: {
                'artist': 'music/artist',
                'album': 'music/album'
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
        return this.children.artist || null;
    }

    set artist(artist) {
        this.children.artist = artist;
    }

    get album() {
        return this.children.album || null;
    }

    set album(album) {
        this.children.album = album;
    }

    get complete() {
        if(!super.complete) {
            return false;
        }

        if(!isDefined(this.title) || this.title.length < 1) {
            return false;
        }

        if(!isDefined(this.duration)) {
            return false;
        }

        return true;
    }

    // endregion

    matches(other) {
        if(super.matches(other)) {
            return true;
        }

        if(isDefined(this.title) && this.title === other.title && this.matchesChildren(other.children)) {
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

    static decode(values, options) {
        if(!isDefined(values) || Object.keys(values).length < 1) {
            return null;
        }

        return new Track(values, options);
    }
}
