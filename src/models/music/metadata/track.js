import Plugin from 'eon.extension.framework/models/plugin';
import {dumpModel} from 'eon.extension.framework/models/core/helpers';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Media} from 'eon.extension.framework/models/metadata';

import merge from 'lodash-es/merge';


export default class Track extends Media {
    constructor(source, id, options) {
        super(source, id, ContentTypes.Music, MediaTypes.Music.Track, options);

        // Set default options
        options = merge({
            artist: null,
            album: null
        }, options || {});

        // Children
        this.artist = options.artist;
        this.album = options.album;
    }

    static create(plugin, id, options) {
        return new Track(
            Plugin.fromPlugin(plugin),
            id, options
        );
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Retrieve identifier
        let id = data.id || data._id;

        if(!isDefined(id)) {
            return null;
        }

        // Construct track metadata
        return new Track(data.source, id, {
            title: data.title,
            duration: data.duration,

            // Children
            artist: data.artist,
            album: data.album
        });
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'music/metadata/track',

            // Children
            '~artist': dumpModel(this.artist),
            '~album': dumpModel(this.album)
        });
    }

    matches(track) {
        return (
            this.title === track.title &&
            this.artist.title === track.artist.title &&
            this.album.title === track.album.title
        );
    }
}
