import Plugin from './base';


export default class SourcePlugin extends Plugin {
    constructor(key, title) {
        super('eon.extension.source.' + key, 'source', title);
    }
}
