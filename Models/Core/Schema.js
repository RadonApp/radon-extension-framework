import CloneDeep from 'lodash-es/cloneDeep';
import IsNil from 'lodash-es/isNil';
import IsPlainObject from 'lodash-es/isPlainObject';

import Properties from '../../Properties';
import BaseModel from './Base';


export {BaseModel};

export default class Model extends BaseModel {
    static Properties = Properties;

    static Schema = {
        id: new Properties.Text({
            change: false,
            identifier: true,

            document: {
                key: '_id',
                required: false
            }
        }),

        revision: new Properties.Text({
            change: true,

            document: {
                key: '_rev',
                required: false
            }
        })
    };

    constructor(values = null) {
        super();

        this._values = values || {};
    }

    get values() {
        return this._values;
    }

    get id() {
        return this.get('id');
    }

    get revision() {
        return this.get('revision');
    }

    assign(item) {
        if(!(item instanceof Model)) {
            throw new Error('Invalid value provided for the "item" parameter');
        }

        // Apply item values
        return this.apply(item.values);
    }

    inherit(item) {
        if(!(item instanceof Model)) {
            throw new Error('Invalid value provided for the "item" parameter');
        }

        let values = this.values;

        // Replace with `item` values
        this._values = CloneDeep(item.values);

        // Apply item values
        return this.apply(values);
    }

    toPlainObject() {
        let obj = {};

        // Copy values to `obj`
        this.copy(obj);

        return obj;
    }

    toReference() {
        let obj = {};

        // Copy reference values to `obj`
        this.copy(obj, {
            identifier: true
        });

        return obj;
    }

    update(values) {
        if(!IsPlainObject(values)) {
            throw new Error('Invalid value provided for the "values" parameter');
        }

        // Apply item values
        return this.apply(values);
    }

    static fromPlainObject(obj, options) {
        if(IsNil(obj)) {
            return null;
        }

        if(!IsPlainObject(obj)) {
            throw new Error('Invalid value provided for the "obj" parameter');
        }

        let item = new this();

        // Apply values from `obj`
        item.apply(obj, options);

        return item;
    }
}
