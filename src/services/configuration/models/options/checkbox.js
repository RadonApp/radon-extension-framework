import {Option} from './core/base';


export default class CheckboxOption extends Option {
    constructor(plugin, key, label, options) {
        super(plugin, 'checkbox', key, label, options);
    }
}
