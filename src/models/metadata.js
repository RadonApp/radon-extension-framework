import {dumpModel} from 'eon.extension.framework/models/core/helpers';
import {setDefault} from 'eon.extension.framework/core/helpers';

import merge from 'lodash-es/merge';


export class Metadata {
    constructor(source, id, content, media, options) {
        this.source = setDefault(source);
        this.id = setDefault(id);

        // Set default options
        options = merge({
            title: null
        }, options || {});

        // Metadata
        this.title = options.title;

        // Content type
        this.type = {
            content: setDefault(content),
            media: setDefault(media)
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
        this.duration = options.duration || null;
    }

    dump() {
        return merge(super.dump(), {
            duration: this.duration
        });
    }
}
