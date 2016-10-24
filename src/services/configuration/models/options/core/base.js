import {isDefined} from 'eon.extension.framework/core/helpers';
import {getProperty} from './helpers';
import Model from '../../base';


export class Option extends Model {
    constructor(plugin, type, key, label, options) {
        super(plugin, type, key);

        this.label = label;

        // Parse options
        this.options = this._parseOptions(options || {});
    }

    _parseOptions(options) {
        return {
            default: getProperty(options, 'default', null),
            summary: getProperty(options, 'summary', null),

            componentId: this._parseComponentId(options.componentId),
            requires: this._parseRequiresOption(options.requires)
        };
    }

    _parseComponentId(componentId) {
        if(!isDefined(componentId)) {
            return null;
        }

        if(componentId.indexOf('eon.') === 0) {
            return componentId;
        }

        return this.plugin.id + ':' + componentId;
    }

    _parseRequiresOption(requires) {
        if(!isDefined(requires)) {
            return [];
        }

        return requires.map((key) => {
            if(key.indexOf(':') !== -1) {
                return key;
            }

            return this.plugin.id + ':' + key;
        });
    }
}

export class PluginOption extends Option {
    constructor(plugin, type, key, label, options) {
        super(plugin, plugin.id + ':' + type, key, label, options);
    }
}
