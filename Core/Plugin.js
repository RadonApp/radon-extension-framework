import Plugin from '../Models/Plugin/Core/Base';


export class MainPlugin extends Plugin {
    constructor() {
        super('neon-extension', 'core');
    }
}

export default new MainPlugin();
