import Service from '../base';


export default class ScrobbleService extends Service {
    constructor(plugin) {
        super(plugin, 'scrobble', 'destination/scrobble');
    }
}
