import Plugin from 'eon.extension.framework/models/plugin';
import {dumpModel} from 'eon.extension.framework/models/core/helpers';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Media} from 'eon.extension.framework/models/metadata';

import merge from 'lodash-es/merge';


export default class Episode extends Media {
    constructor(source, id, options) {
        super(source, id, ContentTypes.Video, MediaTypes.Video.Episode, options);

        // Set default options
        options = merge({
            number: null,

            show: null,
            season: null
        }, options || {});

        // Metadata
        this.number = options.number;

        // Children
        this.show = options.show;
        this.season = options.season;
    }

    static create(plugin, id, options) {
        return new Episode(
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

        // Construct episode metadata
        return new Episode(data.source, id, data);
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'video/metadata/episode',

            'number': this.number,

            // Children
            '~show': dumpModel(this.show),
            '~season': dumpModel(this.season)
        });
    }

    matches(track) {
        return (
            this.title === track.title &&
            this.show.title === track.show.title &&
            this.season.title === track.season.title
        );
    }
}
