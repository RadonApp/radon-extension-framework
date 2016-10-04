import merge from 'lodash-es/merge';


export default class Plugin {
    constructor(id, type, title, manifest) {
        this.id = id;
        this.type = type;

        this.title = title;
        this.manifest = manifest || null;

        // Validate parameters
        if(this.manifest === null) {
            console.warn('Plugin "%s": no manifest defined', this.id);
        }

        // Private variables
        this._enabledTodo = false;
    }

    get enabled() {
        if(!this._enabledTodo) {
            console.warn('Plugin "%s": check if the plugin has been enabled', this.id);
            this._enabledTodo = true;
        }

        return true;
    }

    get contentScripts() {
        if(this.manifest === null) {
            return [];
        }

        return this.manifest['content_scripts'];
    }

    get permissions() {
        if(this.manifest === null) {
            return [];
        }

        return merge({
            permissions: [],
            origins: []
        }, this.manifest['permissions']);
    }

    dump() {
        return {
            id: this.id,
            type: this.type,
            title: this.title
        };
    }
}
