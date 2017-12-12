import ForEach from 'lodash-es/forEach';
import IsEqual from 'lodash-es/isEqual';
import IsNil from 'lodash-es/isNil';
import IsPlainObject from 'lodash-es/isPlainObject';
import IsString from 'lodash-es/isString';
import Map from 'lodash-es/map';
import MapKeys from 'lodash-es/mapKeys';
import MapValues from 'lodash-es/mapValues';
import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';
import PickBy from 'lodash-es/pickBy';
import Reduce from 'lodash-es/reduce';
import Without from 'lodash-es/without';

import Log from 'neon-extension-framework/core/logger';
import Model from 'neon-extension-framework/models/core/base';
import {createSlug} from 'neon-extension-framework/core/helpers/metadata';
import {product} from 'neon-extension-framework/core/helpers/value';


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

            // Omit properties
            ...Omit(values, [
                'id',
                'revision',
                'type',

                'metadata'
            ])
        };

        this.metadata = values.metadata || {};

        this.children = children || {};

        // Generate slug
        this._generateSlug();
    }

    get type() {
        return this.constructor.type;
    }

    get keys() {
        return this.values.keys;
    }

    get slug() {
        if(IsNil(this.values.keys['item'])) {
            return null;
        }

        return this.values.keys['item'].slug || null;
    }

    get title() {
        return this.values.title;
    }

    set title(title) {
        this.values.title = title;

        // Generate slug
        this._generateSlug();
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

    createSelectors(options) {
        options = {
            prefix: null,
            reference: false,

            ...(options || {})
        };

        // Identifier Selector
        if(!IsNil(this.id)) {
            let selector = {};

            selector[(options.prefix || '') + '_id'] = this.id;

            return [selector];
        }

        // Create base selector
        let base = {};

        if(!options.reference) {
            base[(options.prefix || '') + 'type'] = this.type;
        }

        // Create selectors
        let selectors = [Map(this._getOrderedKeys({ prefix: options.prefix }), (selector) => ({
            ...base,
            ...selector
        }))];

        ForEach(this.children, (child, name) => {
            if(IsNil(child)) {
                Log.debug('No "' + name + '" has been defined');
                return;
            }

            try {
                selectors.push(child.createSelectors({
                    prefix: (options.prefix || '') + name + '.',
                    reference: true
                }));
            } catch(e) {
                Log.debug('Unable to create "' + name + '" selectors: ' + (e && e.message ? e.message : e));
            }
        });

        // Merge selectors
        return Map(product(...selectors), (selectors) =>
            Merge({}, ...selectors)
        );
    }

    get(source) {
        return {
            ...Pick(this.values, this.constructor.metadata),
            ...(this.metadata[source] || {}),

            keys: this.values.keys[source] || {}
        };
    }

    matches(other) {
        if(IsNil(other) || this.type !== other.type) {
            return false;
        }

        if(!IsNil(this.id) && this.id !== other.id) {
            return false;
        }

        if(!this._matchesKeys(other.keys)) {
            return false;
        }

        if(!this._matchesChildren(other.children)) {
            return false;
        }

        return true;
    }

    merge(current) {
        if(IsNil(current)) {
            return false;
        }

        let currentDocument = current.toDocument();

        // Update (or validate) identifier
        if(IsNil(this.id)) {
            this.id = current.id;
        } else if(!IsNil(current.id) && this.id !== current.id) {
            throw new Error('Item id mismatch');
        }

        // Update revision
        if(IsNil(this.revision)) {
            this.revision = current.revision;
        } else if(!IsNil(current.revision) && this.revision !== current.revision) {
            throw new Error('Item revision mismatch');
        }

        // Merge values
        this.values = {
            ...(current.values || {}),

            // Update values
            ...PickBy(this.values || {}, (value) => !IsNil(value)),

            // Merge keys
            keys: Merge(
                this.values.keys || {},
                current.values.keys || {}
            ),

            // Fixed values
            title: current.title || this.title,
            createdAt: current.createdAt || this.createdAt
        };

        // Merge children
        ForEach(current.children, (child, name) => {
            if(IsNil(child)) {
                return;
            }

            if(IsNil(this.children[name])) {
                this.children[name] = child;
            } else {
                this.children[name].merge(child);
            }
        });

        // Merge metadata
        ForEach(Object.keys(current.metadata), (source) => {
            this.metadata[source] = {
                ...Pick(current.values, this.constructor.metadata),
                ...current.metadata[source],

                ...Pick(this.values, this.constructor.metadata),
                ...(this.metadata[source] || {})
            };
        });

        // Check for changes
        return !IsEqual(currentDocument, this.toDocument());
    }

    update(source, values) {
        if(IsNil(values)) {
            return this;
        }

        // Set local metadata properties (if not already defined)
        ForEach(Object.keys(this.values), (key) => {
            if(IsNil(this.values[key]) && !IsNil(values[key])) {
                this.values[key] = values[key];
            }
        });

        // Generate slug
        this._generateSlug();

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

    toPlainObject() {
        let data = PickBy(this.values, (value) => !IsNil(value));

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

                    return !IsEqual(data[key], value);
                })
            )),
            (metadata) => Object.keys(metadata).length > 0
        );

        if(Object.keys(metadata).length > 0) {
            data.metadata = metadata;
        }

        // Include children as plain objects
        ForEach(this.children, (child, name) => {
            if(IsNil(child)) {
                return;
            }

            data[name] = child.toPlainObject();
        });

        // Include optional values
        if(!IsNil(this.id)) {
            data['id'] = this.id;
        }

        if(!IsNil(this.revision)) {
            data['revision'] = this.revision;
        }

        if(!IsNil(this.constructor.type)) {
            data['type'] = this.constructor.type;
        }

        return data;
    }

    toReference() {
        if(IsNil(this.id)) {
            return null;
        }

        let reference = {
            '_id': this.id,

            ...Pick(this.values, [
                'keys',
                'title'
            ])
        };

        // Include children as references
        ForEach(this.children, (child, name) => {
            if(IsNil(child)) {
                return;
            }

            reference[name] = child.toReference();
        });

        return reference;
    }

    // endregion

    // region Private Methods

    _generateSlug() {
        this.values.keys['item'] = {
            ...(this.values.keys['item'] || {}),

            slug: createSlug(this.title)
        };
    }

    _getOrderedKeys(options) {
        options = {
            prefix: null,

            ...(options || {})
        };

        // Build array of sources
        let sources = Without(Object.keys(this.keys), 'item').concat(['item']);

        // Build array of keys
        return Reduce(sources, (result, source) =>
            Reduce(this.keys[source], (result, value, name) => {
                let item = {};

                item[(options.prefix || '') + 'keys.' + source + '.' + name] = value;

                result.push(item);
                return result;
            }, result),
        []);
    }

    _matchesChildren(children) {
        for(let key in children) {
            if(!children.hasOwnProperty(key) || IsNil(this.children[key])) {
                continue;
            }

            // Compare children
            if(!this.children[key].matches(children[key])) {
                return false;
            }
        }

        return true;
    }

    _matchesKeys(keys) {
        for(let source in keys) {
            if(!keys.hasOwnProperty(source) || IsNil(this.keys[source])) {
                continue;
            }

            for(let name in keys[source]) {
                if(!keys[source].hasOwnProperty(name) || IsNil(this.keys[source][name]) || IsNil(keys[source][name])) {
                    continue;
                }

                if(this.keys[source][name] === keys[source][name]) {
                    return true;
                }
            }
        }

        return false;
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
        // Decode children
        let children = MapValues(this.children, (type, name) => {
            let value = values[name];

            if(IsNil(value) || !IsPlainObject(value)) {
                return value || null;
            }

            // Ensure parser instance has been provided
            if(IsNil(options) || IsNil(options.parser)) {
                throw new Error('Missing required option: parser');
            }

            // Decode child
            return options.parser.decode(type, value);
        });

        // Filter (and map) values
        values = Omit(
            MapKeys(values, (value, key) => {
                if(key === '_id') {
                    return 'id';
                }

                if(key === '_rev') {
                    return 'revision';
                }

                return key;
            }),
            Object.keys(this.children)
        );

        // Create item
        return (new this(values, children));
    }

    // endregion
}
