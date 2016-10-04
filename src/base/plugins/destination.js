import Plugin from './base';


export default class DestinationPlugin extends Plugin {
    constructor(key, title, manifest) {
        super('eon.extension.destination.' + key, 'destination', title, manifest);
    }
}
