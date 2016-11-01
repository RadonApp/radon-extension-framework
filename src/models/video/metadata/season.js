import Plugin from 'eon.extension.framework/models/plugin';
import {dumpModel} from 'eon.extension.framework/models/core/helpers';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Metadata} from 'eon.extension.framework/models/metadata';

import merge from 'lodash-es/merge';


export default class Season extends Metadata {
    constructor(source, id, options) {
        super(source, id, ContentTypes.Video, MediaTypes.Video.Season, options);

        // Set default options
        options = merge({
            number: null,

            show: null,
            season: null
        }, options || {});

        // Metadata
        this.year = options.year;
        this.number = options.number;

        // Children
        this.show = options.show;
    }

    static create(plugin, id, options) {
        return new Season(
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

        // Construct season metadata
        return new Season(data.source, id, data);
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'video/metadata/season',

            'year': this.year,
            'number': this.number,

            '~show': dumpModel(this.show)
        });
    }
}
