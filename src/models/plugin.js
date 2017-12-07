import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';


export default class Plugin {
    constructor(id, type, options) {
        this.id = id;
        this.type = type;

        // Set default options
        options = Merge({
            title: null
        }, options || {});

        // Optional properties
        this.title = options.title || id;
    }

    static fromPlugin(plugin) {
        return new Plugin(
            plugin.id,
            plugin.type,
            plugin.title
        );
    }

    static parse(data) {
        if(IsNil(data)) {
            return null;
        }

        // Retrieve identifier
        let id = data.id || data._id;

        if(IsNil(id)) {
            return null;
        }

        // Retrieve type
        let type = data.type || data['#type'];

        if(IsNil(type) || type.indexOf('/') < 0) {
            return null;
        }

        // Retrieve plugin type
        let pluginType = type.substring(type.indexOf('/') + 1);

        // Construct plugin
        return new Plugin(id, pluginType, {
            title: data.title
        });
    }

    dump() {
        return {
            '_id': this.id,
            '#type': 'plugin/' + this.type,

            'title': this.title
        };
    }
}
