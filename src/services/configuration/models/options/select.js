import {Option} from './core/base';


export default class SelectOption extends Option {
    constructor(plugin, name, choices, options) {
        super(plugin, 'select', name, options);

        this.options.choices = choices;
    }

    get() {
        return this.preferences.getString(this.name);
    }
}
