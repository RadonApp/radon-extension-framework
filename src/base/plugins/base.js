export default class Plugin {
    constructor(id, type, title) {
        this.id = id;
        this.type = type;
        this.title = title;

        this._enabled_todo = false;
    }

    get enabled() {
        if(!this._enabled_todo) {
            console.warn('TODO: check if the plugin has been enabled');
            this._enabled_todo = true;
        }

        return true;
    }

    dump() {
        return {
            id: this.id,
            type: this.type,
            title: this.title
        };
    }
}
