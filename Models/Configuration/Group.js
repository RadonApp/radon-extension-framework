import ForEach from 'lodash-es/forEach';
import IsNil from 'lodash-es/isNil';
import IsPlainObject from 'lodash-es/isPlainObject';

import Model from './Core/Base';


export default class Group extends Model {
    constructor(plugin, name, children, options) {
        super(plugin, 'group', name);

        if(IsNil(children) || !Array.isArray(children)) {
            throw new Error('Invalid value provided for the "children" parameter (expected an array)');
        }

        if(!IsNil(options) && !IsPlainObject(options)) {
            throw new Error('Invalid value provided for the "options" parameter (expected an object)');
        }

        this.children = children;

        this.parent = null;

        // Parse options
        this.options = this._parseOptions(options);

        // Bind children
        ForEach(this.children, (child) => child.bind(this));
    }

    get id() {
        if(IsNil(this.parent)) {
            throw new Error('Option hasn\'t been bound');
        }

        return this.parent.id + ':' + this.name;
    }

    get key() {
        if(IsNil(this.parent)) {
            throw new Error('Option hasn\'t been bound');
        }

        if(IsNil(this.parent.key)) {
            return this.name;
        }

        return this.parent.key + '.' + this.name;
    }

    get namespace() {
        if(IsNil(this.parent)) {
            throw new Error('Option hasn\'t been bound');
        }

        return this.parent.namespace;
    }

    get preferences() {
        if(IsNil(this.parent)) {
            throw new Error('Option hasn\'t been bound');
        }

        return this.parent.preferences.context(this.name);
    }

    bind(parent) {
        this.parent = parent;
    }

    _parseOptions(options) {
        return {};
    }
}
