import Plugin from 'eon.extension.framework/base/plugins/base';

import Manifest from '../../manifest.json';


export class MainPlugin extends Plugin {
    constructor() {
        super('eon.extension', 'eon', Manifest);
    }
}

export default new MainPlugin();
