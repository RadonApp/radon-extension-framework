import Plugin from './Core/Base';


export default class SourcePlugin extends Plugin {
    constructor(key) {
        super(`neon-extension-source-${key}`, 'source');
    }
}
