export const SessionState = {
    null: 0,
    stalled: 1,
    loading: 2,

    playing: 3,

    pausing: 4,
    paused: 5,

    ended: 6
};

export default class Session {
    constructor(source, key, item, state) {
        this.source = typeof source !== 'undefined' ? source : null;

        this.key = typeof key !== 'undefined' ? key : null;
        this.item = typeof item !== 'undefined' ? item : null;

        this.state = typeof state !== 'undefined' ? state : SessionState.null;

        this.samples = [];

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
        if(this.time === null || this.item === null || this.item.duration === null) {
            return null;
        }

        return this.time / this.item.duration;
    }

    dump() {
        return {
            type: 'session',

            key: this.key,
            state: this.state,

            time: this.time,
            progress: this.progress,
            stalledAt: this.stalledAt,

            item: this.item ? this.item.dump() : null,
            source: this.source ? this.source.dump() : null
        };
    }
}
