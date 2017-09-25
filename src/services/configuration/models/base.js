import {isDefined} from 'neon-extension-framework/core/helpers';


export default class Model {
    constructor(plugin, type, key) {
        this.plugin = plugin;
        this.type = type;
        this.key = key;

        // Generate global identifier
        if(isDefined(key)) {
            this.id = plugin.id + ':' + key;
        } else {
            this.id = plugin.id;
        }
    }
}
