import Service from './base';


export default class MigrateService extends Service {
    constructor(plugin) {
        super(plugin, 'migrate', 'migrate');
    }

    onPreferences(preferences) { }
}
