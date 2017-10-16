import Plugin from 'neon-extension-framework/core/plugin';

import Service from '../base';


export default class LibraryService extends Service {
    constructor(plugin) {
        super(plugin, 'library', 'source/library');

        // Create activity messaging service
        this.messaging = Plugin.messaging.service('library');
    }

    refresh() {
        throw new Error('LibraryService.refresh() hasn\'t been implemented');
    }
}
