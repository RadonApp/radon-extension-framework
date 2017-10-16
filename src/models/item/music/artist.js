import MapKeys from 'lodash-es/mapKeys';
import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';

import Item from 'neon-extension-framework/models/item/core/base';
import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Artist extends Item {
    constructor(values) {
        super('music/artist', values);
    }

    // region Properties

    get title() {
        return this.values.title || null;
    }

    set title(title) {
        this.values.title = title;
    }

    // endregion

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

    static fromDocument(document) {
        if(!isDefined(document) || Object.keys(document).length < 1) {
            return null;
        }

        // Create artist
        return new Artist(MapKeys(document, (value, key) => {
            if(key === '_id') {
                return 'id';
            }

            if(key === '_rev') {
                return 'revision';
            }

            return key;
        }));
    }

    static fromPlainObject(item) {
        if(!isDefined(item) || Object.keys(item).length < 1) {
            return null;
        }

        return new Artist(item);
    }
}
