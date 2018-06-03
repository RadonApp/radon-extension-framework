import {Option} from './Core/Base';


export default class CheckboxOption extends Option {
    constructor(plugin, name, options) {
        super(plugin, 'checkbox', name, options);
    }

    isChecked() {
        return this.preferences.getBoolean(this.name);
    }
}
