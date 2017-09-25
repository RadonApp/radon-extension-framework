import Plugin from './base';


export default class SourcePlugin extends Plugin {
    constructor(key, manifest) {
        super('neon-extension-source-' + key, 'source', manifest);
    }
}
