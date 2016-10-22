/* eslint-disable no-multi-spaces, key-spacing */
import {isDefined, round} from 'eon.extension.framework/core/helpers';

export const SessionState = {
    created:    'created',
    stalled:    'stalled',
    playing:    'playing',

    pausing:    'pausing',
    paused:     'paused',

    ended:      'ended'
};


export default class Session {
    constructor(source, key, options) {
        // Validate parameters
        if(!isDefined(source)) {
            throw new Error('Invalid value provided for the "source" parameter');
        }

        if(!isDefined(key)) {
            throw new Error('Invalid value provided for the "key" parameter');
        }

        this.source = source;
        this.key = key;

        // Parse options
        if(!isDefined(options)) {
            options = {};
        }

        this.identifier = isDefined(options.identifier) ?
            options.identifier :
            null;

        this.metadata = isDefined(options.metadata) ?
            options.metadata :
            null;

        this.state = isDefined(options.state) ?
            options.state :
            SessionState.created;

        // Timing samples
        this.samples = [];

        // Stalled status
        this.stalledAt = null;
        this.stalledPreviousState = null;
    }

    get time() {
        if(this.samples.length < 1) {
            return null;
        }

        return this.samples[this.samples.length - 1];
    }

    get progress() {
        if(this.time === null || this.metadata === null || this.metadata.duration === null) {
            return null;
        }

        return round((this.time / this.metadata.duration) * 100, 2);
    }

    dump() {
        return {
            type: 'session',
            source: this.source.dump(),
            key: this.key,

            identifier: isDefined(this.identifier) ?
                this.identifier.dump() :
                null,

            metadata: isDefined(this.metadata) ?
                this.metadata.dump() :
                null,

            // Status
            state: this.state,

            time: this.time,
            progress: this.progress,

            // Stalled status
            stalledAt: this.stalledAt,
            stalledPreviousState: this.stalledPreviousState
        };
    }
}
