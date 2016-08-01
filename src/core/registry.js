export class Registry {
    constructor() {

    }

    register(plugin) {
        console.log('register', plugin);
    }
}

export default new Registry();
