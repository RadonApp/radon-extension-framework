import Service from './Core/Base';


export default class ConfigurationService extends Service {
    constructor(plugin, options) {
        super(plugin, 'configuration', 'configuration');

        this.options = options;
    }
}
