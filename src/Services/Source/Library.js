import {Services} from 'neon-extension-framework/Core/Constants';

import Service from '../Core/Base';


export default class LibraryService extends Service {
    constructor(plugin) {
        super(plugin, 'library', Services.Source.Library);

        // Create activity messaging service
        this._service = this.messaging.service('library');
    }

    refresh() {
        throw new Error('LibraryService.refresh() hasn\'t been implemented');
    }

    emit(name, payload, options) {
        return this._service.emit(name, payload, options);
    }
}
