/* eslint-disable no-multi-spaces, key-spacing */
import Debounce from 'lodash-es/debounce';
import ForEach from 'lodash-es/forEach';
import IsFunction from 'lodash-es/isFunction';
import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';

import Log from '../../../Core/Logger';
import Plugin from '../../../Core/Plugin';
import Session, {SessionState} from '../../../Models/Session';
import {MediaTypes} from '../../../Core/Enums';


const EventHandlers = [
    'create',
    'load',

    'open',
    'close',

    'start',
    'progress',
    'seek',
    'pause',
    'stop'
];

export default class ActivityEngine {
    constructor(plugin, options) {
        this.plugin = plugin;

        // Create event handlers
        ForEach(EventHandlers, (name) => {
            if(IsNil(this[name]) || !IsFunction(this[name])) {
                throw new Error(`Unknown event handler: ${name}`);
            }

            this[name] = this._createEventHandler(name, this[name]);
        });

        // Create debounced create function
        this.createDebounced = Debounce(this.create.bind(this), 500);

        // Create activity messaging service
        this.messaging = Plugin.messaging.service('scrobble');

        // Bind events
        this.messaging.on('session.created', (session) => this.created(session));
        this.messaging.on('session.updated', (session) => this.updated(session));

        // Parse options, and set defaults
        this.options = Merge({
            metadataRefreshInterval: 7 * 24 * 60 * 60 * 1000,  // 7 days
            progressInterval: 5000,

            getMetadata: null,
            fetchMetadata: null,

            isEnabled: null
        }, options);

        // Private attributes
        this._currentSession = null;

        this._progressEmittedAt = null;
        this._pauseTimeout = null;
    }

    get enabled() {
        if(IsNil(this.options.isEnabled)) {
            return false;
        }

        return this.options.isEnabled();
    }

    bind(emitter) {
        emitter.on('created',   this.createDebounced.bind(this));
        emitter.on('loaded',    this.load.bind(this));

        // Player
        emitter.on('opened',    this.open.bind(this));
        emitter.on('closed',    this.close.bind(this));

        // Media
        emitter.on('started',   this.start.bind(this));
        emitter.on('progress',  this.progress.bind(this));
        emitter.on('seeked',    this.seek.bind(this));
        emitter.on('paused',    this.pause.bind(this));
        emitter.on('stopped',   this.stop.bind(this));
    }

    create(item, options) {
        options = {
            force: false,

            ...(options || {})
        };

        Log.trace('Creating session (item: %o, force: %o)', item, options.force);

        if(!IsNil(this._currentSession) && this._currentSession.valid) {
            let active = this._currentSession.state !== SessionState.ended;

            // Check if session has already been created
            if(this._currentSession.item.matches(item) && active && !options.force) {
                Log.debug('Session already exists for %o, triggering start action instead', item);

                // Trigger start action
                if(this._currentSession.progress >= 1) {
                    return this.start();
                }

                // Ignore event
                return false;
            }

            if(active) {
                Log.debug('Stopping existing session: %o', this._currentSession);

                // Trigger stop action
                this.stop();
            }
        }

        // Ignore special episodes (and bonus content)
        if(item.type === MediaTypes.Video.Episode && (item.number === 0 || item.season.number === 0)) {
            Log.info('Ignored special episode: %o', item);

            // Clear current session
            this._currentSession = null;

            return Promise.resolve();
        }

        // Retrieve metadata, and create session
        return this._getItem(item).then((item) => {
            if(IsNil(item)) {
                return;
            }

            Log.trace('Creating session with metadata: %o', item);

            // Create session
            this._currentSession = Session.create(item, {
                clientId: this.messaging.client.id
            });

            // Reset state
            this._created = false;

            // Emit "created" event
            this.messaging.emit('activity.created', this._currentSession.toPlainObject());
        });
    }

    created(payload) {
        let session = Session.fromPlainObject(payload);

        // Ensure session is valid
        if(IsNil(session)) {
            Log.warn('Unable to parse session: %o', payload);
            return;
        }

        // Refresh metadata (if expired), and set current session
        this._refreshItem(session.item).then(() => {
            Log.debug('Created session: %o', session);

            // Update current session
            this._currentSession = session;

            // Update state
            this._created = true;
        });
    }

    updated(payload) {
        let session = Session.fromPlainObject(payload);

        // Ensure session is valid
        if(IsNil(session)) {
            Log.warn('Unable to parse session: %o', payload);
            return;
        }

        Log.debug('Updated session: %o', session);

        // Update current session
        this._currentSession = session;
    }

    load(item) {
        Log.trace('Player loaded (item: %o)', item);

        // Trigger create action
        return this.createDebounced(item);
    }

    // region Player

    open(item) {
        Log.trace('Player opened (item: %o)', item);

        // Trigger create action
        return this.createDebounced(item);
    }

    close(item) {
        Log.trace('Player closed (item: %o)', item);

        if(IsNil(this._currentSession) || IsNil(this._currentSession.item)) {
            Log.trace('No active session, ignoring close action');
            return false;
        }

        if(!this._currentSession.item.matches(item)) {
            Log.debug('Session item doesn\'t match, ignoring close action');
            return false;
        }

        // Trigger stop action
        return this.stop();
    }

    // endregion

    // region Media

    start() {
        Log.trace('Media started');

        if(!this.enabled) {
            Log.trace('Activity engine is not enabled, ignoring start action');
            return false;
        }

        if(IsNil(this._currentSession) || !this._created) {
            Log.trace('No active session, ignoring start action');
            return false;
        }

        if(this._currentSession.state === SessionState.playing) {
            Log.debug('Session has already been started');
            return false;
        }

        // Ensure progress is available
        if(IsNil(this._currentSession.progress)) {
            if(IsNil(this._currentSession.item)) {
                return this.error('Unable to calculate session progress, no item available');
            }

            if(IsNil(this._currentSession.item.duration)) {
                return this.error('Unable to calculate session progress, no duration defined');
            }

            Log.debug('Session has no progress yet');
            return false;
        }

        // Switch back to previous stalled state
        if(this._currentSession.state === SessionState.stalled) {
            // Update session state
            this._currentSession.state = !IsNil(this._currentSession.stalledPreviousState) ?
                this._currentSession.stalledPreviousState :
                SessionState.created;

            // Clear stalled state
            this._clearStalledState();
        }

        // Cancel pause timer
        this._cancelPause();

        // Ensure session isn't already playing
        if(this._currentSession.state === SessionState.playing) {
            Log.trace('Session has already started');
            return false;
        }

        // Ensure session hasn't ended
        if(this._currentSession.state === SessionState.ended) {
            Log.trace('Session has already ended');
            return false;
        }

        // Update state
        this._currentSession.state = SessionState.playing;

        // Update progress emitted timestamp (delay the first "progress" event by `options.progressInterval`)
        this._progressEmittedAt = Date.now();

        // Emit "started" event (if session is valid)
        if(this._currentSession.valid) {
            this.messaging.emit('activity.started', this._currentSession.toPlainObject());
        }

        return true;
    }

    progress(time) {
        Log.trace('Media progress (time: %o)', time);

        if(!this.enabled) {
            Log.trace('Activity engine is not enabled, ignoring progress action');
            return false;
        }

        if(isNaN(time)) {
            Log.info('Ignoring invalid progress action');
            return false;
        }

        if(IsNil(this._currentSession) || !this._created) {
            Log.trace('No active session, ignoring progress action');
            return false;
        }

        if(this._currentSession.state === SessionState.ended) {
            return false;
        }

        // Detect current activity state (based on changes in watched time)
        let state = this._detectState(time);

        // Calculate delta
        let { delta, deltaPercent } = this._calculateDelta(time);

        // Create new session when the item is repeated
        if(deltaPercent < -90) {
            // Wait until 10 seconds has been played
            // (needs to be higher than the media change debounce time)
            if(time < 10 * 1000) {
                return false;
            }

            Log.debug('Media restarted, creating new session');

            // Create session
            return this.createDebounced(this._currentSession.item, { force: true });
        }

        // Create seek events
        if(Math.abs(delta) > 15 * 1000) {
            this.seek(time);
        }

        // Update session
        this._currentSession.time = time;

        // Trigger state change
        if(state !== null && this._currentSession.state !== state) {
            return this.stateChange(this._currentSession.state, state);
        }

        // Ensure session is playing
        if(this._currentSession.state !== SessionState.playing) {
            return true;
        }

        // Cancel pause timer
        this._cancelPause();

        // Check if we should emit progress
        if(!this._shouldEmitProgress()) {
            return false;
        }

        // Stop session if we have reached 100% progress
        if(this._currentSession.progress >= 100) {
            Log.debug('Media has reached 100% progress, stopping the session');
            return this.stop();
        }

        // Emit "progress" event (if session is valid)
        if(this._currentSession.valid) {
            this.messaging.emit('activity.progress', this._currentSession.toPlainObject());
        }

        // Update progress emitted timestamp
        this._progressEmittedAt = Date.now();
        return true;
    }

    seek(time) {
        Log.trace('Media seeked (time: %o)', time);

        if(!this.enabled) {
            Log.trace('Activity engine is not enabled, ignoring seek action');
            return false;
        }

        if(isNaN(time)) {
            Log.info('Ignoring invalid seek action');
            return false;
        }

        if(IsNil(this._currentSession)) {
            Log.trace('No active session, ignoring seek action');
            return false;
        }

        // Ensure session hasn't ended
        if(this._currentSession.state === SessionState.ended) {
            return false;
        }

        // Calculate delta
        let { delta } = this._calculateDelta(time);

        if(Math.abs(delta) <= 15 * 1000) {
            return false;
        }

        // Trigger start action if the session hasn't been started yet
        if(this._currentSession.state !== SessionState.playing) {
            return this.start();
        }

        // Update session
        this._currentSession.time = time;

        // Emit "seeked" event (if session is valid)
        if(this._currentSession.valid) {
            this.messaging.emit('activity.seeked', this._currentSession.toPlainObject());
        }

        return true;
    }

    stateChange(previous, current) {
        Log.trace('Media state changed: %o -> %o', previous, current);

        if(IsNil(this._currentSession)) {
            Log.trace('No active session, ignoring state change action');
            return false;
        }

        // Started
        if((previous === SessionState.created || previous === SessionState.paused) &&
            current === SessionState.playing) {
            return this.start();
        }

        // Paused
        if((previous === SessionState.playing || previous === SessionState.stalled) &&
            current === SessionState.paused) {
            return this.pause();
        }

        // Ended
        if((previous === SessionState.playing || previous === SessionState.paused) &&
            current === SessionState.ended) {
            return this.stop();
        }

        Log.trace('Unknown state transition: %o -> %o', previous, current);

        // Update state
        this._currentSession.state = current;
        return true;
    }

    pause() {
        Log.trace('Media paused');

        if(!this.enabled) {
            Log.trace('Activity engine is not enabled, ignoring pause action');
            return false;
        }

        if(IsNil(this._currentSession)) {
            Log.trace('No active session, ignoring pause action');
            return false;
        }

        // Ensure media isn't paused
        if(this._currentSession.state === SessionState.paused) {
            Log.debug('Session has already been paused');
            return false;
        }

        // Ensure media isn't pausing
        if(this._currentSession.state === SessionState.pausing) {
            return false;
        }

        // Update state
        this._currentSession.state = SessionState.pausing;

        // Emit "paused" event in 8000ms
        this._pauseTimeout = setTimeout(() => {
            if(IsNil(this._currentSession) || this._currentSession.state !== SessionState.pausing) {
                return;
            }

            // Stop session at 80% progress
            if(this._currentSession.progress >= 80) {
                this.stop();
                return;
            }

            // Update state
            this._currentSession.state = SessionState.paused;

            // Emit event (if session is valid)
            if(this._currentSession.valid) {
                this.messaging.emit('activity.paused', this._currentSession.toPlainObject());
            }
        }, 8000);

        return true;
    }

    stop() {
        Log.trace('Media stopped');

        if(IsNil(this._currentSession)) {
            Log.trace('No active session, ignoring stop action');
            return false;
        }

        let state = this._currentSession.state;

        // Ensure session hasn't already ended
        if(state === SessionState.ended) {
            Log.debug('Session has already been stopped');
            return false;
        }

        // Store previous state when the session has stalled
        if(state === SessionState.stalled) {
            state = this._currentSession.stalledPreviousState;
        }

        // Ensure session has been started
        if(state === SessionState.created) {
            Log.debug('Session hasn\'t been started yet, ignoring stop action');
            return false;
        }

        // Update state
        this._currentSession.state = SessionState.ended;
        this._currentSession.endedAt = Date.now();

        // Emit event (if session is valid)
        if(this._currentSession.valid) {
            this.messaging.emit('activity.stopped', this._currentSession.toPlainObject());
        }

        return true;
    }

    error(message) {
        Log.error('Media error: %s', message);

        if(IsNil(this._currentSession) || this._currentSession.state === SessionState.ended) {
            return false;
        }

        // Update state
        this._currentSession.state = SessionState.ended;
        this._currentSession.endedAt = Date.now();

        return true;
    }

    // endregion

    // region Private methods

    _calculateDelta(time) {
        if(this._currentSession.state !== SessionState.playing) {
            return { delta: 0, deltaPercent: 0 };
        }

        let duration = this._currentSession.item.duration;

        // Calculate delta
        return {
            delta: time - this._currentSession.time,
            deltaPercent: ((time / duration) - (this._currentSession.time / duration)) * 100
        };
    }

    _cancelPause() {
        if(IsNil(this._pauseTimeout)) {
            return false;
        }

        // Cancel timer
        clearTimeout(this._pauseTimeout);

        // Reset state
        this._pauseTimeout = null;
        return true;
    }

    _clearStalledState() {
        if(IsNil(this._currentSession)) {
            return false;
        }

        this._currentSession.stalledAt = null;
        this._currentSession.stalledPreviousState = null;

        return true;
    }

    _createEventHandler(name, target) {
        return (...args) => {
            let promise;

            try {
                promise = target.apply(this, args);
            } catch(e) {
                Log.error(
                    'Unable to process event, "%s" handler raised: %s',
                    name, (e && e.message) ? e.message : e
                );

                return Promise.reject(e);
            }

            // Catch rejected promise
            return Promise.resolve(promise).catch((err) => {
                Log.error(
                    'Unable to process event, "%s" promise was rejected with: %s',
                    name, (err && err.message) ? err.message : err
                );
            });
        };
    }

    _detectState(time) {
        // Ensure session and time is available
        if(IsNil(this._currentSession) || IsNil(this._currentSession.time)) {
            return null;
        }

        // Ensure item metadata and duration is available
        if(IsNil(this._currentSession.item) || IsNil(this._currentSession.item.duration)) {
            return null;
        }

        // Media progress
        if(time > this._currentSession.time) {
            // Clear stalled state
            this._clearStalledState();

            // Progress changed
            return SessionState.playing;
        }

        // Ignore created, paused and pausing states
        if(this._currentSession.state === SessionState.created ||
           this._currentSession.state === SessionState.paused ||
           this._currentSession.state === SessionState.pausing) {
            return null;
        }

        // Switch to paused if the session has been stalled for over 5 seconds
        if(this._currentSession.state === SessionState.stalled && Date.now() - this._currentSession.stalledAt > 5000) {
            // Stalled for over 5 seconds, assume paused
            return SessionState.paused;
        }

        // Store current state
        this._currentSession.stalledPreviousState = this._currentSession.state;

        // Update `stalledAt` timestamp
        this._currentSession.stalledAt = Date.now();

        // Switch to stalled state
        return SessionState.stalled;
    }

    _getItem(item) {
        if(IsNil(this.options.getMetadata)) {
            Log.debug('No "getMetadata" handler defined');
            return Promise.resolve(item);
        }

        // Retrieve metadata from "getMetadata" handler
        return Promise.resolve().then(() =>
            this.options.getMetadata(item)
        ).catch((err) => {
            Log.warn('Unable to retrieve metadata: %s', (err && err.message) ? err.message : err);

            // Reject promise
            return Promise.reject(new Error('Unable to retrieve metadata'));
        });
    }

    _refreshItem(item) {
        if(IsNil(this.options.fetchMetadata)) {
            return Promise.resolve();
        }

        let fetchedAt = item.resolve(this.plugin.id).get('fetchedAt');
        let fetchedAgo;

        if(!IsNil(fetchedAt)) {
            fetchedAgo = Date.now() - fetchedAt;

            Log.trace('Item fetched %d second(s) ago', fetchedAgo / 1000);
        }

        // Fetch metadata (if the item is incomplete, or has expired)
        if(IsNil(item.duration) || IsNil(fetchedAgo) || fetchedAgo > this.options.metadataRefreshInterval) {
            return Promise.resolve(this.options.fetchMetadata(item)).catch((err) => {
                Log.error('Unable to fetch metadata for item %o: %s', item, err && err.message ? err.message : err);
            });
        }

        return Promise.resolve();
    }

    _shouldEmitProgress() {
        return (
            IsNil(this._progressEmittedAt) ||
            Date.now() - this._progressEmittedAt > this.options.progressInterval
        );
    }

    // endregion
}
