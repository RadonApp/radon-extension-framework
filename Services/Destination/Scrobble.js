import Log from '../../Core/Logger';
import {Services} from '../../Core/Constants';
import Service from '../Core/Base';


export default class ScrobbleService extends Service {
    constructor(plugin, accepts) {
        super(plugin, 'scrobble', Services.Destination.Scrobble);

        this.accepts = accepts;
    }

    onSessionUpdated(event, session) {
        try {
            if(event === 'created') {
                return this.onCreated(session);
            }

            if(event === 'started') {
                return this.onStarted(session);
            }

            if(event === 'seeked') {
                return this.onSeeked(session);
            }

            if(event === 'progress') {
                return this.onProgress(session);
            }

            if(event === 'paused') {
                return this.onPaused(session);
            }

            if(event === 'stopped') {
                return this.onStopped(session);
            }

            Log.warn('Invalid activity event received: %o', event);
        } catch(e) {
            Log.error('Unable to process session event %o: %s', event, e.message, e);
        }

        return false;
    }

    onCreated(session) {}
    onSeeked(session) {}
    onProgress(session) {}
    onPaused(session) {}
    onStopped(session) {}

    onStarted(session) {
        throw new Error('Not Implemented');
    }
}
