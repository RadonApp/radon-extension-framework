import {Services} from 'neon-extension-framework/Core/Constants';

import Service from './Core/Base';


export default class MigrateService extends Service {
    constructor(plugin) {
        super(plugin, 'migrate', Services.Migrate);
    }
}
