import Plugin from 'eon.extension.framework/models/plugin';
import {dumpModel} from 'eon.extension.framework/models/core/helpers';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Metadata} from 'eon.extension.framework/models/metadata';

import merge from 'lodash-es/merge';


export default class Album extends Metadata {
    constructor(source, id, options) {
        super(source, id, ContentTypes.Music, MediaTypes.Music.Album, options);

        // Set default options
        options = merge({
            artist: null
        }, options || {});

        // Children
        this.artist = options.artist;
    }

    static create(plugin, id, options) {
        return new Album(
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

        // Construct album metadata
        return new Album(data.source, id, data);
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'music/metadata/album',

            // Children
            '~artist': dumpModel(this.artist)
        });
    }
}
