import Merge from 'lodash-es/merge';

import Preferences from 'eon.extension.framework/preferences';
import {getProperty} from './core/helpers';
import {Option} from './core/base';


export default class EnableOption extends Option {
    constructor(plugin, key, label, options) {
        super(plugin, 'enable', key, label, options);
    }

    isEnabled() {
        return Preferences.getBoolean(this.id);
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
