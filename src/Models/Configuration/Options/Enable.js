import Merge from 'lodash-es/merge';

import {Option} from './Core/Base';
import {getProperty} from './Core/Helpers';


export default class EnableOption extends Option {
    constructor(plugin, name, options) {
        super(plugin, 'enable', name, options);
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
