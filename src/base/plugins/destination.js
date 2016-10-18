import Plugin from './base';


export default class DestinationPlugin extends Plugin {
    constructor(key, manifest) {
        super('eon.extension.destination.' + key, 'destination', manifest);
    }
}
