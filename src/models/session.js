/* eslint-disable no-multi-spaces, key-spacing */
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

        this._time = options.time;
        this._progress = options.progress;

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

        if(this.time === null || this.metadata === null || this.metadata.duration === null) {
            return null;
        }

        return round((this.time / this.metadata.duration) * 100, 2);
    }

    dump() {
        return {
            '_id': this.id,
            '#type': 'session',

            // Channel identifier
            'channelId': this.channelId,

            // Session status
            'state': this.state,

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
