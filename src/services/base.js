export default class Service {
    constructor(plugin, key, type) {
        this.plugin = plugin;
        this.key = key;
        this.type = type;

        // Generate global identifier
        this.id = plugin.id + ':' + key;

        // Private variables
        this._enabledTodo = false;
        this._initialized = false;
    }

    get enabled() {
        if(!this._enabledTodo) {
            console.warn('TODO: check if the service has been enabled');
            this._enabledTodo = true;
        }

        return true;
    }

    get initialized() {
        return this._initialized;
    }

    initialize() {
        this._initialized = true;
    }
}
