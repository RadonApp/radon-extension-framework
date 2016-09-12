import Service from '../base';


export default class SyncService extends Service {
    constructor(plugin) {
        super(plugin, 'sync', 'source/sync');
    }
}
