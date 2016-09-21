import Service from '../base';


export default class ConfigurationService extends Service {
    constructor(plugin, options) {
        super(plugin, 'configuration', 'configuration');

        this.options = options;
    }
}
