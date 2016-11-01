import Plugin from 'eon.extension.framework/models/plugin';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Media} from 'eon.extension.framework/models/metadata';

import merge from 'lodash-es/merge';


export default class Movie extends Media {
    constructor(source, id, options) {
        super(source, id, ContentTypes.Video, MediaTypes.Video.Movie, options);

        // Set default options
        options = merge({
            year: null
        }, options || {});

        // Metadata
        this.year = options.year;
    }

    static create(plugin, id, options) {
        return new Movie(
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

        // Construct movie metadata
        return new Movie(data.source, id, data);
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'video/metadata/movie',

            'year': this.year
        });
    }

    matches(track) {
        return (
            this.title === track.title
        );
    }
}
