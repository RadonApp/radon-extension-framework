import Service from './Core/Base';


export default class MigrateService extends Service {
    constructor(plugin) {
        super(plugin, 'migrate', 'migrate');
    }
}
