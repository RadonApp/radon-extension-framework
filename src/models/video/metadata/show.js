import Plugin from 'eon.extension.framework/models/plugin';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Metadata} from 'eon.extension.framework/models/metadata';

import merge from 'lodash-es/merge';


export default class Show extends Metadata {
    constructor(source, id, options) {
        super(source, id, ContentTypes.Video, MediaTypes.Video.Show, options);

        // Set default options
        options = merge({
            year: null
        }, options || {});

        // Metadata
        this.year = options.year;
    }

    static create(plugin, id, options) {
        return new Show(
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

        // Construct show metadata
        return new Show(data.source, id, data);
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'video/metadata/show',

            'year': this.year
        });
    }
}
