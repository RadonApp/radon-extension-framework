import Plugin from './base';


export default class SourcePlugin extends Plugin {
    constructor(key, title, manifest) {
        super('eon.extension.source.' + key, 'source', title, manifest);
    }
}
