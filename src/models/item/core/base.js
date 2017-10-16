import Assign from 'lodash-es/assign';
import CloneDeep from 'lodash-es/cloneDeep';
import ForEach from 'lodash-es/forEach';
import IsPlainObject from 'lodash-es/isPlainObject';
import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';
import PickBy from 'lodash-es/pickBy';

import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Item {
    constructor(type, values, children) {
        this.values = {type, ...values || {}};

        this._children = children || {};

        // Validate type
        if(this.values.type !== type) {
            throw new Error('Invalid type');
        }
    }

    // region Properties

    get id() {
        return this.values.id || null;
    }

    set id(id) {
        this.values.id = id;
    }

    get type() {
        return this.values.type;
    }

    get children() {
        return Object.keys(this._children);
    }

    get ids() {
        return this.values.ids || {};
    }

    set ids(ids) {
        this.values.ids = ids;
    }

    get createdAt() {
        return this.values.createdAt || null;
    }

    set createdAt(createdAt) {
        this.values.createdAt = createdAt;
    }

    get updatedAt() {
        return this.values.updatedAt || null;
    }

    set updatedAt(updatedAt) {
        this.values.updatedAt = updatedAt;
    }

    get seenAt() {
        return this.values.seenAt || null;
    }

    set seenAt(seenAt) {
        this.values.seenAt = seenAt;
    }

    get changed() {
        return this.values.changed || false;
    }

    set changed(changed) {
        this.values.changed = changed;
    }

    get complete() {
        return this.values.complete || false;
    }

    set complete(complete) {
        this.values.complete = complete;
    }

    get revision() {
        return this.values.revision || null;
    }

    set revision(revision) {
        this.values.revision = revision;
    }

    // endregion

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

    update(values) {
        Assign(this.values, PickBy(values, isDefined));
    }

    toDocument(options) {
        options = Merge({
            keys: {}
        }, options || {});

        // Validate options
        if(isDefined(options.keys.include) && isDefined(options.keys.exclude)) {
            throw new Error('Only one key filter should be defined');
        }

        // Build document
        let document = {
            'type': this.type
        };

        if(isDefined(this.id)) {
            document['_id'] = this.id;
        }

        if(isDefined(this.revision)) {
            document['_rev'] = this.revision;
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

    toPlainObject(options) {
        let result = CloneDeep(this.values);

        // Encode children (if they are defined)
        ForEach(this._children, (value, key) => {
            if(!isDefined(value)) {
                return;
            }

            result[key] = value.toPlainObject();
        });

        return result;
    }
}
