import Plugin from './base';


export default class SourcePlugin extends Plugin {
    constructor(key) {
        super('neon-extension-source-' + key, 'source');
    }
}
