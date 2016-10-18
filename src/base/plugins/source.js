import Plugin from './base';


export default class SourcePlugin extends Plugin {
    constructor(key, manifest) {
        super('eon.extension.source.' + key, 'source', manifest);
    }
}
