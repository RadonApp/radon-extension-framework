import {isDefined} from 'eon.extension.framework/core/helpers';

import IsPlainObject from 'lodash-es/isPlainObject';
import Pick from 'lodash-es/pick';


export default class Item {
    constructor(id, type, options) {
        this.id = id;
        this.type = type;

        // Define optional properties
        options = options || {};

        this.ids = options.ids || {};

        this.createdAt = options.createdAt || null;
        this.updatedAt = options.updatedAt || null;
        this.seenAt = options.seenAt || null;

        this.changed = options.changed || false;
        this.complete = options.complete || false;
    }

    hasExpired(expires) {
        if(!isDefined((this.updatedAt))) {
            return true;
        }

        return Date.now() - this.updatedAt > expires;
    }

    matches(other) {
        if(isDefined(this.id) && this.id === other.id) {
            return true;
        }

        function match(ids, otherIds) {
            for(let key in ids) {
                if(!ids.hasOwnProperty(key)) {
                    continue;
                }

                // Ignore undefined entries
                if(!isDefined(ids[key]) || !isDefined(otherIds[key])) {
                    continue;
                }

                // Compare entries
                if(IsPlainObject(ids[key]) && IsPlainObject(otherIds[key])) {
                    if(match(ids[key], otherIds[key])) {
                        return true;
                    }
                } else if(ids[key] === otherIds[key]) {
                    return true;
                }
            }

            return false;
        }

        return match(this.ids, other.ids);
    }

    toDocument(options) {
        options = options || {};

        // Build document
        let document = {
            'type': this.type
        };

        if(isDefined(this.id)) {
            document['_id'] = this.id;
        }

        if(isDefined(this.ids)) {
            document['ids'] = this.ids;
        }

        if(isDefined(this.createdAt)) {
            document['createdAt'] = this.createdAt;
        }

        if(isDefined(this.updatedAt)) {
            document['updatedAt'] = this.updatedAt;
        }

        if(isDefined(this.seenAt)) {
            document['seenAt'] = this.seenAt;
        }

        // Filter document by "keys"
        if(isDefined(options.keys)) {
            return Pick(document, options.keys);
        }

        return document;
    }

    toPlainObject(options) {
        return {
            id: this.id,
            type: this.type,

            ids: this.ids,

            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            seenAt: this.seenAt,

            changed: this.changed,
            complete: this.complete
        };
    }
}
