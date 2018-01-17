import {Option} from './core/base';


export default class CheckboxOption extends Option {
    constructor(plugin, name, label, options) {
        super(plugin, 'checkbox', name, label, options);
    }

    isChecked() {
        return this.preferences.getBoolean(this.name);
    }
}
