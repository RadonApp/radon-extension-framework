import {Option} from './core/base';
import {getProperty} from './core/helpers';


export default class EnableOption extends Option {
    constructor(plugin, key, label, options) {
        super(plugin, 'enable', key, label, options);
    }

    _parseOptions(options) {
        let result = super._parseOptions(options);

        return {
            ...result,

            contentScripts: getProperty(options, 'contentScripts', []),
            permissions: getProperty(options, 'permissions', {})
        };
    }
}
