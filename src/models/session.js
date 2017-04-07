/* eslint-disable no-multi-spaces, key-spacing */
import Log from 'eon.extension.framework/core/logger';
import Plugin from 'eon.extension.framework/models/plugin';
import {dumpModel} from 'eon.extension.framework/models/core/helpers';
import {isDefined, round} from 'eon.extension.framework/core/helpers';

import merge from 'lodash-es/merge';
import uuid from 'uuid';


export const SessionState = {
    created:    'created',
    stalled:    'stalled',
    playing:    'playing',

    pausing:    'pausing',
    paused:     'paused',

    ended:      'ended'
};

export const DurationTolerance = 120 * 1000;

export default class Session {
    constructor(source, id, options) {
        // Validate parameters
        if(!isDefined(source)) {
            throw new Error('Invalid value provided for the "source" parameter');
        }

        if(!isDefined(id)) {
            throw new Error('Invalid value provided for the "key" parameter');
        }

        this.source = source;
        this.id = id;

        // Set default options
        options = merge({
            channelId: null,

            // Children
            identifier: null,
            metadata: null,

            // Session status
            state: SessionState.created,

            duration: null,
            time: null,

            progress: null,

            // Timing samples
            samples: [],

            // Stalled status
            stalledAt: null,
            stalledPreviousState: null
        }, options || {});

        // Channel identifier
        this.channelId = options.channelId;

        // Children
        this.identifier = options.identifier;
        this.metadata = options.metadata;

        // Session status
        this.state = options.state;

        this._duration = options.duration;
        this._time = options.time;

        this._progress = options.progress;
        this._valid = true;

        // Timing samples
        this.samples = options.samples;

        // Stalled status
        this.stalledAt = options.stalledAt;
        this.stalledPreviousState = options.stalledPreviousState;
    }

    static create(plugin, options) {
        return new Session(
            Plugin.fromPlugin(plugin),
            uuid.v4(),
            options
        );
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Retrieve identifier
        let id = data.id || data._id;

        if(!isDefined(id)) {
            return null;
        }

        // Construct session
        return new Session(data.source, id, data);
    }

    get duration() {
        if(isDefined(this._duration)) {
            return this._duration;
        }

        if(isDefined(this.metadata) && isDefined(this.metadata.duration)) {
            return this.metadata.duration;
        }

        return null;
    }

    get time() {
        if(isDefined(this._time)) {
            return this._time;
        }

        if(this.samples.length < 1) {
            return null;
        }

        return this.samples[this.samples.length - 1];
    }

    get progress() {
        if(isDefined(this._progress)) {
            return this._progress;
        }

        // Ensure session time has been defined
        if(!isDefined(this.time)) {
            return null;
        }

        // Retrieve session duration
        let duration = this.duration;

        if(!isDefined(duration)) {
            return null;
        }

        // Calculate session progress
        return round((this.time / duration) * 100, 2);
    }

    get valid() {
        // Check if session has already been ignored
        if(!this._valid) {
            return false;
        }

        // Validate session
        if(!this.validate()) {
            this._valid = false;
            return false;
        }

        return true;
    }

    validate() {
        // Ensure metadata has been found
        if(!isDefined(this.metadata)) {
            return false;
        }

        // Validate session duration
        let duration = this.duration;

        if(!isDefined(duration)) {
            return false;
        }

        if(isDefined(this.metadata.duration)) {
            // Check duration delta is within the tolerance
            let delta = Math.abs(this.metadata.duration - this.duration);

            if(delta > DurationTolerance) {
                Log.info(
                    'Ignoring session %o, duration delta (%o) exceeds tolerance (%o)',
                    this.id,
                    delta,
                    DurationTolerance
                );
                return false;
            }
        }

        // Session is valid
        return true;
    }

    dump() {
        return {
            '_id': this.id,
            '#type': 'session',

            // Channel identifier
            'channelId': this.channelId,

            // Session status
            'state': this.state,

            'duration': this.duration,
            'time': this.time,

            'progress': this.progress,

            // Stalled status
            'stalledAt': this.stalledAt,
            'stalledPreviousState': this.stalledPreviousState,

            // Children
            '~source': dumpModel(this.source),
            '~identifier': dumpModel(this.identifier),
            '~metadata': dumpModel(this.metadata)
        };
    }
}
