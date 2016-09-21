import Option from './base';


export default class SwitchOption extends Option {
    constructor(plugin, key, label, options) {
        super(plugin, 'switch', key, label, options);
    }
}
