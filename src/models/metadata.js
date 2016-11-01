import {dumpModel} from 'eon.extension.framework/models/core/helpers';

import merge from 'lodash-es/merge';


export class Metadata {
    constructor(source, id, content, media, options) {
        this.source = source || null;
        this.id = id || null;

        // Set default options
        options = merge({
            title: null
        }, options || {});

        // Metadata
        this.title = options.title;

        // Content type
        this.type = {
            content: content || null,
            media: media || null
        };
    }

    dump() {
        return {
            '_id': this.id,

            'title': this.title,
            'type': this.type,

            // Children
            '~source': dumpModel(this.source)
        };
    }
}

export class Media extends Metadata {
    constructor(source, id, content, media, options) {
        super(source, id, content, media, options);

        // Set default options
        options = merge({
            duration: null
        }, options || {});

        // Metadata
        this.duration = options.duration;
    }

    dump() {
        return merge(super.dump(), {
            duration: this.duration
        });
    }
}
