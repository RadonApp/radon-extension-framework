import Plugin from './base';


export default class DestinationPlugin extends Plugin {
    constructor(key) {
        super('neon-extension-destination-' + key, 'destination');
    }
}
