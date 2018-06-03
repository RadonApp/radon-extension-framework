import Plugin from './Core/Base';


export default class DestinationPlugin extends Plugin {
    constructor(key) {
        super(`neon-extension-destination-${key}`, 'destination');
    }
}
