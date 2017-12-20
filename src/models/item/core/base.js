import CloneDeep from 'lodash-es/cloneDeep';
import ForEach from 'lodash-es/forEach';
import IsNil from 'lodash-es/isNil';
import IsPlainObject from 'lodash-es/isPlainObject';
import IsString from 'lodash-es/isString';
import OmitBy from 'lodash-es/omitBy';

import Model, {BaseModel} from '../../core/base';


export class Metadata extends BaseModel {
    static Apply = {
        exclude: [
            '_id',
            '_rev',

            'id',
            'rev',
            'keys',
            'createdAt'
        ],

        unknown: true
    };

    static Copy = {
        unknown: true
    };

    static Extract = {
        unknown: true
    };

    static Schema = {
        updatedAt: new Model.Properties.Integer({
            deferred: true
        })
    };

    constructor(parent, source) {
        super();

        this._parent = parent;
        this._source = source;
    }

    get parent() {
        return this._parent;
    }

    get source() {
        return this._source;
    }

    get values() {
        return this.parent.metadata[this.source];
    }

    get keys() {
        return this._parent.get('keys')[this.source];
    }

    get updatedAt() {
        return this.get('updatedAt');
    }

    get(key) {
        return super.get(key) || this._parent.get(key);
    }
}

export default class Item extends Model {
    static Metadata = Metadata;
    static Type = null;

    static Schema = {
        ...Model.Schema,

        keys: new Model.Properties.Index({
            reference: true
        }),

        // Timestamps
        createdAt: new Model.Properties.Integer({
            change: false
        })
    };

    constructor(values, metadata) {
        super(values);

        this._metadata = metadata || {};
    }

    get metadata() {
        return this._metadata;
    }

    get type() {
        return this.constructor.Type;
    }

    get keys() {
        return this.get('keys');
    }

    get createdAt() {
        return this.get('createdAt');
    }

    get updatedAt() {
        return this.get('updatedAt');
    }

    inherit(item) {
        if(!(item instanceof Model)) {
            throw new Error('Invalid value provided for the "item" parameter');
        }

        let metadata = this._metadata;
        let values = this._values;

        // Replace with `item` metadata and values
        this._metadata = CloneDeep(item.metadata);
        this._values = CloneDeep(item.values);

        // Update item
        let changed = false;

        // Apply values
        changed = this.apply(this.extract(values, {
            deferred: false
        })) || changed;

        ForEach(metadata, (values, name) => {
            let source = this.resolve(name);

            changed = source.apply(source.extract(values, {
                deferred: false
            })) || changed;
        });

        // Ignore deferred values (if no other changes)
        if(!changed) {
            return false;
        }

        // Apply deferred values
        changed = this.apply(this.extract(values, {
            deferred: true
        })) || changed;

        ForEach(metadata, (values, name) => {
            let source = this.resolve(name);

            changed = source.apply(source.extract(values, {
                deferred: true
            })) || changed;
        });

        return changed;
    }

    resolve(source) {
        if(IsNil(this._metadata[source])) {
            this._metadata[source] = {};
        }

        return new this.constructor.Metadata(this, source);
    }

    toDocument() {
        let doc = {};

        // Copy item values to `document`
        this.copy(doc, { format: 'document' });

        // Copy metadata values to `document`
        let metadata = {};

        ForEach(this.metadata, (values, source) => {
            let data = {};

            // Copy source metadata values to `data`
            this.resolve(source).copy(data, { format: 'document' });

            // Omit duplicate values
            data = OmitBy(data, (value, key) =>
                doc[key] === value
            );

            // Add source metadata (if at least one property exists)
            if(Object.keys(data).length > 0) {
                metadata[source] = data;
            }
        });

        // Include metadata (if at least one source exists)
        if(Object.keys(metadata).length > 0) {
            doc.metadata = metadata;
        }

        // Include type (if defined)
        if(!IsNil(this.type)) {
            doc.type = this.type;
        }

        return doc;
    }

    toPlainObject() {
        let metadata = {};

        ForEach(this.metadata, (values, source) => {
            let data = {};

            // Copy source metadata values to `data`
            this.resolve(source).copy(data);

            // Add source metadata
            metadata[source] = data;
        });

        return {
            ...super.toPlainObject(),
            type: this.type,
            metadata,
        }
    }

    toReference() {
        let obj = {};

        // Copy reference values to `obj`
        this.copy(obj, {
            format: 'document',
            reference: true
        });

        return obj;
    }

    update(source, values) {
        if(!IsString(source)) {
            throw new Error('Invalid value provided for the "source" parameter');
        }

        if(!IsPlainObject(values)) {
            throw new Error('Invalid value provided for the "values" parameter');
        }

        let changed = false;

        // Apply metadata values
        changed = this.resolve(source).apply(values) || changed;

        // Apply item values
        changed = this.apply({
            ...values,

            keys: this._buildSourceKeys(source, values.keys)
        }) || changed;

        return changed;
    }

    static create(source, values) {
        let item = new this();

        // Update `item` with source `values`
        item.update(source, values);

        return item;
    }

    static fromDocument(doc, options) {
        if(IsNil(doc)) {
            return null;
        }

        if(!IsPlainObject(doc)) {
            throw new Error(
                'Invalid value provided for the "doc" parameter ' +
                '(expected plain object)'
            );
        }

        if(!IsNil(this.Type) && doc.type !== this.Type) {
            throw new Error(
                'Invalid value provided for the "doc" parameter ' +
                '(expected value.type === "' + this.Type + '")'
            );
        }

        options = {
            ...options,

            format: 'document'
        };

        // Create item
        let item = new this();

        // Apply metadata values
        ForEach(doc.metadata, (values, source) => {
            this.resolve(source).apply(values, options);
        });

        // Apply item values
        item.apply(doc, options);

        return item;
    }

    _buildSourceKeys(source, keys) {
        let result = {};

        result[source] = keys || {};

        return result;
    }
}
