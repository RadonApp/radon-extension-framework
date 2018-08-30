import ForEach from 'lodash-es/forEach';
import IsNil from 'lodash-es/isNil';
import IsPlainObject from 'lodash-es/isPlainObject';

import Model from './Core/Base';


export default class Page extends Model {
    constructor(plugin, name, children, options) {
        super(plugin, 'page', name);

        if(IsNil(children) || !Array.isArray(children)) {
            throw new Error('Invalid value provided for the "children" parameter (expected an array)');
        }

        if(!IsNil(options) && !IsPlainObject(options)) {
            throw new Error('Invalid value provided for the "options" parameter (expected an object)');
        }

        this.children = children;

        // Parse options
        this.options = this._parseOptions(options);

        // Bind children
        ForEach(this.children, (child) => child.bind(this));
    }

    get id() {
        if(IsNil(this.name)) {
            return this.plugin.id;
        }

        return this.plugin.id + ':' + this.name;
    }

    get key() {
        return null;
    }

    get namespace() {
        if(!IsNil(this.name)) {
            return `${this.plugin.key}/configuration/${this.name}`;
        }

        return `${this.plugin.key}/configuration`;
    }

    get preferences() {
        if(IsNil(this.name)) {
            return this.plugin.preferences;
        }

        return this.plugin.preferences.context(this.name);
    }

    _parseOptions(options) {
        return {};
    }
}
