import Service from '../base';


export default class LibraryService extends Service {
    constructor(plugin) {
        super(plugin, 'library', 'source/library');

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
