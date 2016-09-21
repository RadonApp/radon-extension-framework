import Model from '../base';


export default class Option extends Model {
    constructor(plugin, type, key, label, options) {
        super(plugin, type, key);

        this.label = label;

        // Parse options
        this.options = this._parseOptions(options || {});
    }

    _parseOptions(options) {
        return {
            default: options.default || null,
            requires: this._parseRequiresOption(options.requires)
        };
    }

    _parseRequiresOption(requires) {
        if(!requires) {
            return [];
        }

        return _.map(requires, (key) => {
            if(key.indexOf(':') !== -1) {
                return key;
            }

            return this.plugin.id + ':' + key;
        });
    }
}
