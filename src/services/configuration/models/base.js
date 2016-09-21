export default class Model {
    constructor(plugin, type, key) {
        this.plugin = plugin;
        this.type = type;
        this.key = key;

        // Generate global identifier
        this.id = plugin.id + ':' + key;
    }
}
