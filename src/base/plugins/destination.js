import Plugin from './base';


export default class DestinationPlugin extends Plugin {
    constructor(key, manifest) {
        super('neon-extension-destination-' + key, 'destination', manifest);
    }
}
