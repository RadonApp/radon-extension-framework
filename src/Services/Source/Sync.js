import {Services} from 'neon-extension-framework/Core/Constants';

import Service from '../Core/Base';


export default class SyncService extends Service {
    constructor(plugin) {
        super(plugin, 'sync', Services.Source.Sync);
    }
}
