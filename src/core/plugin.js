import Plugin from 'neon-extension-framework/base/plugins/base';

import Manifest from '../../manifest.json';


export class MainPlugin extends Plugin {
    constructor() {
        super('neon-extension', 'neon', Manifest);
    }
}

export default new MainPlugin();
