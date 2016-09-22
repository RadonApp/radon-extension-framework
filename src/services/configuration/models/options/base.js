import Model from '../base';


export default class Option extends Model {
    constructor(plugin, type, key, label, options) {
        super(plugin, type, key);

        this.label = label;

        // Parse options
        this.options = this._parseOptions(options || {});
    }

    _parseOptions(options) {
        function getProperty(key, defaultValue) {
            if(typeof options[key] === 'undefined') {
                return defaultValue;
            }

            return options[key];
        }

        return {
            default: getProperty('default', null),
            summary: getProperty('summary', null),
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
