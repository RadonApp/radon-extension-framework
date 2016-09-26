import Bus from '../core/bus';


export default class Service {
    constructor(plugin, key, type) {
        this.plugin = plugin;
        this.key = key;
        this.type = type;

        // Generate global identifier
        this.id = plugin.id + ':' + key;

        this._enabled_todo = false;
    }

    get enabled() {
        if(!this._enabled_todo) {
            console.warn('TODO: check if the service has been enabled');
            this._enabled_todo = true;
        }

        return true;
    }

    emit(type, a1, a2, a3, a4, a5) {
        type = this.key + '.' + type;

        return Bus.emit(type, a1, a2, a3, a4, a5);
    }
}
