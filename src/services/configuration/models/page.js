import Model from './base';


export default class Page extends Model {
    constructor(plugin, key, title, children, options) {
        super(plugin, 'page', key);

        this.title = title;
        this.children = children;

        // Parse options
        this.options = this._parseOptions(options);
    }

    _parseOptions(options) {
        return {};
    }
}
