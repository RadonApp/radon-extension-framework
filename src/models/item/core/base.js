import ForEach from 'lodash-es/forEach';
import IsEqual from 'lodash-es/isEqual';
import IsNil from 'lodash-es/isNil';
import IsString from 'lodash-es/isString';
import MapKeys from 'lodash-es/mapKeys';
import MapValues from 'lodash-es/mapValues';
import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';
import PickBy from 'lodash-es/pickBy';
import Slugify from 'slugify';

import Model from 'neon-extension-framework/models/core/base';


export default class Item extends Model {
    static type = null;

    static children = {};

    static itemProperties = [
        'id',
        'revision',

        'createdAt',
        'updatedAt'
    ];

    static metadata = [
        'title'
    ];

    constructor(values, children) {
        super();

        values = values || {};

        this.id = values.id || null;
        this.revision = values.revision || null;

        this.values = {
            keys: {},
            title: null,

            createdAt: null,

            // Include provided values
            ...Omit(values, [
                'id',
                'revision',
                'type',

                'metadata'
            ])
        };

        this.metadata = values.metadata || {};

        this.children = children || {};
    }

    get type() {
        return this.constructor.type;
    }

    get keys() {
        return this.values.keys;
    }

    get title() {
        return this.values.title;
    }

    get createdAt() {
        return this.values.createdAt;
    }

    set createdAt(createdAt) {
        this.values.createdAt = createdAt;
    }

    get updatedAt() {
        return this.values.updatedAt;
    }

    set updatedAt(updatedAt) {
        this.values.updatedAt = updatedAt;
    }

    // region Public Methods

    get(source) {
        return {
            ...Pick(this.values, this.constructor.metadata),
            ...(this.metadata[source] || {}),

            keys: this.values.keys[source] || {}
        };
    }

    merge(base) {
        let previous = this.toDocument();

        // Update (or validate) identifier
        if(IsNil(this.id)) {
            this.id = base.id;
        } else if(!IsNil(base.id) && this.id !== base.id) {
            throw new Error('Item id mismatch');
        }

        // Update revision
        if(IsNil(this.revision)) {
            this.revision = base.revision;
        } else if(!IsNil(base.revision) && this.revision !== base.revision) {
            throw new Error('Item revision mismatch');
        }

        // Merge values
        this.values = {
            ...(base.values || {}),
            ...(this.values || {}),

            // Merge keys
            keys: Merge(
                this.values.keys || {},
                base.values.keys || {}
            ),

            // Override values
            title: base.title || this.title,

            createdAt: base.createdAt || this.createdAt
        };

        // TODO Merge children

        // Merge metadata
        ForEach(Object.keys(base.metadata), (source) => {
            this.metadata[source] = {
                ...Pick(base.values, this.constructor.metadata),
                ...base.metadata[source],

                ...Pick(this.values, this.constructor.metadata),
                ...(this.metadata[source] || {}),
            };
        });

        // Check for changes
        return !IsEqual(previous, this.toDocument());
    }

    update(source, values) {
        if(IsNil(values)) {
            return this;
        }

        // Set local metadata properties (if not already defined)
        ForEach(Object.keys(this.values), (key) => {
            if(IsNil(this.values[key]) &&!IsNil(values[key])) {
                this.values[key] = values[key];
            }
        });

        // Update keys
        this.values.keys['item'] = {
            ...(this.values.keys['item'] || {}),

            slug: !IsNil(this.title) ?
                Slugify(this.title, { lower: true }) :
                null
        };

        // Update source keys
        this.values.keys[source] = {
            ...(this.values.keys[source] || {}),
            ...(values.keys || {})
        };

        // Update source metadata
        this.metadata[source] = {
            ...(this.metadata[source] || {}),
            ...Omit(values, ['keys'])
        };

        return this;
    }

    toDocument() {
        let doc = PickBy(this.values, (value) => !IsNil(value));

        // Build metadata
        let metadata = PickBy(
            MapValues(this.metadata, (metadata) => PickBy(
                PickBy(metadata, (value, key) => {
                    if(key === 'keys') {
                        return false;
                    }

                    if(this.constructor.metadata.indexOf(key) < 0) {
                        return true;
                    }

                    return !IsEqual(doc[key], value);
                })
            )),
            (metadata) => Object.keys(metadata).length > 0
        );

        if(Object.keys(metadata).length > 0) {
            doc.metadata = metadata;
        }

        // Include optional values
        if(!IsNil(this.id)) {
            doc['_id'] = this.id;
        }

        if(!IsNil(this.revision)) {
            doc['_rev'] = this.revision;
        }

        if(!IsNil(this.constructor.type)) {
            doc['type'] = this.constructor.type;
        }

        return doc;
    }

    // endregion

    // region Static Methods

    static create(source, values, children) {
        if(!IsString(source)) {
            throw new Error('Invalid value provided for the "source" parameter (expected string)');
        }

        // Create item
        let item = (new this(
            Pick(values, this.itemProperties),
            children
        ));

        // Update item with source metadata
        return item.update(
            source,
            Omit(values, this.itemProperties)
        );
    }

    static decode(values, options) {
        values = MapKeys(values, (value, key) => {
            if(key === '_id') {
                return 'id';
            }

            if(key === '_rev') {
                return 'revision';
            }

            return key;
        });

        // Create item
        return (new this(values, {}));
    }

    // endregion
}
