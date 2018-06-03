import ForEach from 'lodash-es/forEach';
import IsEqual from 'lodash-es/isEqual';
import IsNil from 'lodash-es/isNil';
import MapKeys from 'lodash-es/mapKeys';
import MapValues from 'lodash-es/mapValues';


export default class BaseModel {
    static Schema = {};

    get applyOptions() {
        return {
            exclude: [],
            unknown: false,

            ...(this.constructor.Apply || {})
        };
    }

    get copyOptions() {
        return {
            exclude: [],
            unknown: false,

            ...(this.constructor.Copy || {})
        };
    }

    get extractOptions() {
        return {
            exclude: [],
            unknown: false,

            ...(this.constructor.Extract || {})
        };
    }

    get schema() {
        return this.constructor.Schema;
    }

    get schemaByFormat() {
        if(IsNil(this.constructor.SchemaByFormat)) {
            this.constructor.SchemaByFormat = {};
        }

        return this.constructor.SchemaByFormat;
    }

    get values() {
        throw new Error('BaseModel.values: Not Implemented');
    }

    apply(source, options) {
        options = {
            format: 'plain',

            ...(options || {}),

            changes: {
                identifier: null,

                ...((options || {}).changes || {})
            }
        };

        let schema = this.getFormatSchema(options.format);
        let changed = false;

        ForEach(source, (value, sourceKey) => {
            if(this.applyOptions.exclude.indexOf(sourceKey) >= 0) {
                return;
            }

            // Retrieve property from schema
            let {key, prop} = schema[sourceKey] || {};

            if(IsNil(prop)) {
                if(this.applyOptions.unknown && !IsEqual(this.values[sourceKey], value)) {
                    this.values[sourceKey] = value;
                    changed = true;
                }

                return;
            }

            // Apply value to property
            let propChanged = prop.apply(source, this.values, key, {
                ...options,
                item: this
            });

            // Apply `changes.identifier` filter
            if(!IsNil(options.changes.identifier) && prop.identifier !== options.changes.identifier) {
                return;
            }

            // Update `changed` value
            if(propChanged) {
                changed = true;
            }
        });

        return changed;
    }

    copy(target, options) {
        options = {
            format: 'plain',

            deferred: null,
            identifier: null,
            reference: null,

            ...(options || {})
        };

        let schema = this.getFormatSchema('plain');
        let copied = false;

        ForEach(this.values, (value, sourceKey) => {
            if(this.copyOptions.exclude.indexOf(sourceKey) >= 0) {
                return;
            }

            // Retrieve property from schema
            let {key, prop} = schema[sourceKey] || {};

            if(IsNil(prop)) {
                if(this.copyOptions.unknown) {
                    target[sourceKey] = value;
                    copied = true;
                }

                return;
            }

            // Apply deferred filter
            if(!IsNil(options.deferred) && prop.deferred !== options.deferred) {
                return;
            }

            // Apply identifier filter
            if(!IsNil(options.identifier) && prop.identifier !== options.identifier) {
                return;
            }

            // Apply reference filter
            if(!IsNil(options.reference) && prop.reference !== options.reference) {
                return;
            }

            // Copy value to property
            copied = prop.copy(this.values, target, key, {
                ...options,
                item: this
            }) || copied;
        });

        return copied;
    }

    extract(source, options) {
        options = {
            format: 'plain',

            deferred: null,
            identifier: null,
            reference: null,

            ...(options || {})
        };

        let schema = this.getFormatSchema(options.format);
        let obj = {};

        ForEach(source, (value, sourceKey) => {
            if(this.extractOptions.exclude.indexOf(sourceKey) >= 0) {
                return;
            }

            // Retrieve property from schema
            let {key, prop} = schema[sourceKey] || {};

            if(IsNil(prop)) {
                if(this.extractOptions.unknown) {
                    obj[sourceKey] = value;
                }

                return;
            }

            // Apply deferred filter
            if(!IsNil(options.deferred) && prop.deferred !== options.deferred) {
                return;
            }

            // Apply identifier filter
            if(!IsNil(options.identifier) && prop.identifier !== options.identifier) {
                return;
            }

            // Apply reference filter
            if(!IsNil(options.reference) && prop.reference !== options.reference) {
                return;
            }

            // Copy value to property
            prop.copy(source, obj, key, {
                format: options.format,
                item: this
            });
        });

        return obj;
    }

    get(key, defaultValue) {
        let prop = this.schema[key];

        if(IsNil(prop)) {
            return this.values[key] || defaultValue;
        }

        return prop.get(this.values, key) || defaultValue || null;
    }

    getFormatSchema(format) {
        if(IsNil(this.schemaByFormat[format])) {
            // Create format for schema
            this.schemaByFormat[format] = MapKeys(
                MapValues(this.schema, (prop, key) => ({ key, prop })),
                ({key, prop}) => prop.getOption(format, 'key', key)
            );
        }

        // Return cached format schema
        return this.schemaByFormat[format];
    }

    set(key, value) {
        let prop = this.schema[key];

        if(!IsNil(prop)) {
            prop.set(this.values, key, value);
        } else {
            this.values[key] = value;
        }
    }

    update(values) {
        throw new Error('BaseModel.update(values): Not Implemented');
    }
}
