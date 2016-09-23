import {Option} from './base';


export default class CheckboxOption extends Option {
    constructor(plugin, key, label, options) {
        super(plugin, 'checkbox', key, label, options);
    }
}
