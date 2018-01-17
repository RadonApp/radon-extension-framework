import {Option} from './core/base';


export default class SelectOption extends Option {
    constructor(plugin, name, label, choices, options) {
        super(plugin, 'select', name, label, options);

        this.options.choices = choices;
    }

    get() {
        return this.preferences.getString(this.name);
    }
}
