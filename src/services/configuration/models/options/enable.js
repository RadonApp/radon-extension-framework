import {Option} from './base';


export default class EnableOption extends Option {
    constructor(plugin, key, label, options) {
        super(plugin, 'enable', key, label, options);
    }
}
