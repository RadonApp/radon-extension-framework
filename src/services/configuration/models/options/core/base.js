import {getProperty} from './helpers';
import Model from '../../base';

import merge from 'lodash-es/merge';


export class Option extends Model {
    constructor(plugin, type, key, label, options) {
        super(plugin, type, key);

        this.label = label;

        // Parse options
        this.options = this._parseOptions(options || {});
    }

    _parseOptions(options) {
        return {
            component: getProperty(options, 'component', null),
            default: getProperty(options, 'default', null),
            summary: getProperty(options, 'summary', null),

            requires: this._parseRequiresOption(options.requires)
        };
    }

    _parseRequiresOption(requires) {
        if(!requires) {
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
    constructor(plugin, type, key, label, component, options) {
        super(plugin, plugin.id + ':' + type, key, label, merge({
            component: component
        }, options));
    }
}
