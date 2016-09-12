import Service from './base';


export default class OptionsService extends Service {
    constructor(plugin, options) {
        super(plugin, 'options', 'options');

        this.options = options;
    }
}
