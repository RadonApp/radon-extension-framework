import IsNil from 'lodash-es/isNil';

import Model from '../../base';
import {getProperty} from './helpers';


export class Option extends Model {
    constructor(plugin, type, name, label, options) {
        super(plugin, type, name);

        this.label = label;

        this.parent = null;

        // Parse options
        this.options = this._parseOptions(options || {});
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

        return this.parent.preferences;
    }

    bind(parent) {
        this.parent = parent;
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
        if(IsNil(componentId)) {
            return null;
        }

        if(componentId.indexOf('neon-') === 0) {
            return componentId;
        }

        return this.plugin.id + ':' + componentId;
    }

    _parseRequiresOption(requires) {
        if(IsNil(requires)) {
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
