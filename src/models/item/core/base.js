import Assign from 'lodash-es/assign';
import CloneDeep from 'lodash-es/cloneDeep';
import ForEach from 'lodash-es/forEach';
import IsEqual from 'lodash-es/isEqual';
import IsPlainObject from 'lodash-es/isPlainObject';
import MapKeys from 'lodash-es/mapKeys';
import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';
import PickBy from 'lodash-es/pickBy';

import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Item {
    constructor(type, values, options) {
        this.type = type;

        this.children = {};
        this.values = {};

        this.id = null;
        this.revision = null;

        this.createdAt = null;
        this.updatedAt = null;

        this.changed = false;

        // Parse options
        this.options = {
            children: {},
            builder: null,

            ...options
        };

        // Update values
        this.update(values, {
            ignoreChanges: true
        });
    }

    // region Properties

    get ids() {
        return this.values.ids || {};
    }

    set ids(ids) {
        this.values.ids = ids;
    }

    get fetchedAt() {
        return this.values.fetchedAt || null;
    }

    set fetchedAt(fetchedAt) {
        this.values.fetchedAt = fetchedAt;
    }

    get complete() {
        if(!isDefined(this.type) || this.type.length < 1) {
            return false;
        }

        for(let key in this.options.children) {
            if(!this.options.children.hasOwnProperty(key)) {
                continue;
            }

            if(!isDefined(this.children[key])) {
                return false;
            }

            if(!this.children[key].complete) {
                return false;
            }
        }

        return true;
    }

    // endregion

    hasExpired(expires) {
        if(!isDefined((this.fetchedAt))) {
            return true;
        }

        return Date.now() - this.fetchedAt > expires;
    }

    matches(other) {
        if(isDefined(this.id) && this.id === other.id) {
            return true;
        }

        if(this.matchesIds(other.ids)) {
            return true;
        }

        return false;
    }

    matchesChildren(children) {
        for(let key in children) {
            if(!children.hasOwnProperty(key) || !isDefined(this.children[key])) {
                continue;
            }

            // Compare children
            if(!this.children[key].matches(children[key])) {
                return false;
            }
        }

        return true;
    }

    matchesIds(otherIds, ids) {
        if(!isDefined(ids)) {
            ids = this.ids;
        }

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
                if(this.matchesIds(otherIds[key], ids[key])) {
                    return true;
                }
            } else if(ids[key] === otherIds[key]) {
                return true;
            }
        }

        return false;
    }

    merge(other, options) {
        if(IsPlainObject(other)) {
            throw new Error('Invalid value provided for "other" (expected item instance)');
        }

        let changed = false;

        // Parse options
        options = Merge({
            ignoreChanges: false
        }, options || {});

        // Update properties
        this.updateProperties(other);

        // Update values
        this.update(other.values, options);

        // Update children
        changed = this.updateChildren(other.children) || changed;

        // Update state
        if(changed && !options.ignoreChanges) {
            this.changed = true;
        }

        return this;
    }

    update(values, options) {
        if(!IsPlainObject(values)) {
            throw new Error('Invalid value provided for "other" (expected plain object)');
        }

        if(isDefined(values.type) && values.type !== this.type) {
            throw new Error('Invalid type');
        }

        let changed = false;

        // Parse options
        options = Merge({
            ignoreChanges: false
        }, options || {});

        // Parse values
        values = MapKeys(PickBy(values, isDefined), (value, key) => {
            if(key === '_id') {
                return 'id';
            }

            if(key === '_rev') {
                return 'revision';
            }

            return key;
        });

        // Retrieve children
        let children = {};

        for(let key in values) {
            if(!values.hasOwnProperty(key)) {
                continue;
            }

            if(!isDefined(values[key]) || !isDefined(this.options.children[key])) {
                continue;
            }

            children[key] = values[key];
        }

        // Build update values
        let update = {
            ...this.values,

            // Include values
            ...Omit(values, [
                ...Object.keys(children),

                'id',
                'revision',
                'type',

                'createdAt',
                'updatedAt'
            ]),

            // Identifiers
            ids: PickBy(
                // Merge identifiers
                Merge(
                    this.values.ids || {},
                    values.ids || {}
                ),
                // Validate identifiers (removes legacy identifiers)
                (value, key) => {
                    return key.indexOf('neon-extension-') === 0;
                }
            )
        };

        if(isDefined(update.artist)) {
            throw new Error();
        }

        if(isDefined(update.album)) {
            throw new Error();
        }

        // Check if values have changed
        if(Object.keys(this.values).length > 0 && !IsEqual(this.values, update)) {
            changed = true;
        }

        // Update properties
        this.updateProperties(values);

        // Update values
        Assign(this.values, update);

        // Update children
        changed = this.updateChildren(children) || changed;

        // Update state
        if(changed && !options.ignoreChanges) {
            this.changed = true;
        }

        return this;
    }

    updateChildren(children) {
        let changed = false;

        for(let key in children) {
            if(!children.hasOwnProperty(key)) {
                continue;
            }

            let type = this.options.children[key];
            let child = children[key];

            // Validate value
            if(!isDefined(child) || Object.keys(child).length < 1) {
                continue;
            }

            // Update item
            if(!isDefined(this.children[key])) {
                if(!isDefined(this.options.builder)) {
                    throw new Error('Unable to decode "' + type + '" item, builder isn\'t available');
                }

                // Decode item
                if(IsPlainObject(child)) {
                    this.children[key] = this.options.builder.decode({type, ...child});
                } else {
                    this.children[key] = child;
                }

                // Mark as changed
                changed = true;
            } else {
                // Update item
                if(IsPlainObject(child)) {
                    this.children[key].update(child);
                } else {
                    this.children[key].merge(child);
                }

                // Mark as changed
                if(this.children[key].changed) {
                    changed = true;
                }
            }
        }

        return changed;
    }

    updateProperties(other) {
        ForEach(['id', 'revision', 'createdAt', 'updatedAt'], (key) => {
            if(isDefined(this[key])) {
                return;
            }

            // Update property
            this[key] = other[key];
        });
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

        if(isDefined(this.fetchedAt)) {
            document['fetchedAt'] = this.fetchedAt;
        }

        if(isDefined(this.updatedAt)) {
            document['updatedAt'] = this.updatedAt;
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

        // Include additional properties
        Assign(result, {
            id: this.id,
            revision: this.revision,
            type: this.type,

            createdAt: this.createdAt,
            fetchedAt: this.fetchedAt,
            updatedAt: this.updatedAt
        });

        // Encode children (if they are defined)
        ForEach(this.children, (value, key) => {
            if(!isDefined(value)) {
                return;
            }

            result[key] = value.toPlainObject();
        });

        return result;
    }
}
