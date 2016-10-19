import Log from 'eon.extension.framework/core/logger';

import Service from '../base';


export default class ScrobbleService extends Service {
    constructor(plugin, accepts) {
        super(plugin, 'scrobble', 'destination/scrobble');

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

            if(event === 'ended') {
                return this.onEnded(session);
            }

            Log.warn('Invalid activity event received: %o', event);
        } catch(e) {
            Log.error('Unable to process session event %o:', event, e);
        }

        return false;
    }

    onCreated(session) {}
    onSeeked(session) {}
    onProgress(session) {}
    onPaused(session) {}
    onEnded(session) {}

    onStarted(session) {
        throw new Error('Not Implemented');
    }
}
