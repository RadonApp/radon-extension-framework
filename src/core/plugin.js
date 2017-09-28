import Plugin from 'neon-extension-framework/base/plugins/base';


export class MainPlugin extends Plugin {
    constructor() {
        super('neon-extension', 'core');
    }
}

export default new MainPlugin();
