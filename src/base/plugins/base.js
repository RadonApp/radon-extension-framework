export default class Plugin {
    constructor(id, type, title) {
        this.id = id;
        this.type = type;
        this.title = title;
    }

    get enabled() {
        // TODO check permissions have been granted and the plugin has been enabled
        return true;
    }
}
