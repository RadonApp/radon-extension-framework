import IsNil from 'lodash-es/isNil';


export default class Model {
    constructor(plugin, type, key) {
        this.plugin = plugin;
        this.type = type;
        this.key = key;

        // Generate global identifier
        if(!IsNil(key)) {
            this.id = plugin.id + ':' + key;
        } else {
            this.id = plugin.id;
        }
    }
}
