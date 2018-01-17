import ForEach from 'lodash-es/forEach';
import IsNil from 'lodash-es/isNil';

import Model from './base';


export default class Page extends Model {
    constructor(plugin, name, title, children, options) {
        super(plugin, 'page', name);

        this.title = title;
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
