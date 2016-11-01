import Plugin from 'eon.extension.framework/models/plugin';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Metadata} from 'eon.extension.framework/models/metadata';

import merge from 'lodash-es/merge';


export default class Artist extends Metadata {
    constructor(source, id, options) {
        super(source, id, ContentTypes.Music, MediaTypes.Music.Artist, options);
    }

    static create(plugin, id, options) {
        return new Artist(
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

        // Construct artist metadata
        return new Artist(data.source, id, {
            title: data.title
        });
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'music/metadata/artist'
        });
    }
}
