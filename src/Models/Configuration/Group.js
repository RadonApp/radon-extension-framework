import ForEach from 'lodash-es/forEach';
import IsNil from 'lodash-es/isNil';

import Model from './Core/Base';


export default class Group extends Model {
    constructor(plugin, name, children, options) {
        super(plugin, 'group', name);

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
