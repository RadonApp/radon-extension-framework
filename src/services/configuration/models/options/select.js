import Preferences from 'eon.extension.framework/preferences';

import {Option} from './core/base';


export default class SelectOption extends Option {
    constructor(plugin, key, label, choices, options) {
        super(plugin, 'select', key, label, options);

        this.options.choices = choices;
    }

    get() {
        return Preferences.getString(this.id);
    }
}
