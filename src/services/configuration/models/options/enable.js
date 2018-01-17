import Merge from 'lodash-es/merge';

import {Option} from './core/base';
import {getProperty} from './core/helpers';


export default class EnableOption extends Option {
    constructor(plugin, name, label, options) {
        super(plugin, 'enable', name, label, options);
    }

    isEnabled() {
        return this.preferences.getBoolean(this.name);
    }

    _parseOptions(options) {
        let result = super._parseOptions(options);

        return Merge(result, {
            type: getProperty(options, 'type', 'option'),

            permissions: getProperty(options, 'permissions', false),
            contentScripts: getProperty(options, 'contentScripts', false)
        });
    }
}
