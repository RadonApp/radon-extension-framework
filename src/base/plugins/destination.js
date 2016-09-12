import Plugin from './base';


export default class DestinationPlugin extends Plugin {
    constructor(key, title) {
        super('eon.extension.destination.' + key, 'destination', title);
    }
}
