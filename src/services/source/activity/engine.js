/* eslint-disable no-multi-spaces, key-spacing */
import Merge from 'lodash-es/merge';

import Log from 'neon-extension-framework/core/logger';
import Plugin from 'neon-extension-framework/core/plugin';
import Session, {SessionState} from 'neon-extension-framework/models/session';
// import {Episode} from 'neon-extension-framework/models/item/television';
import {isDefined} from 'neon-extension-framework/core/helpers';


export default class ActivityEngine {
    constructor(plugin, options) {
        this.plugin = plugin;

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
        if(!isDefined(this.options.isEnabled)) {
            return false;
        }

        return this.options.isEnabled();
    }

    bind(emitter) {
        emitter.on('created',   this.create.bind(this));
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

    create(item) {
        Log.trace('Creating session (item: %o)', item);

        // Check if session has already been created
        if(isDefined(this._currentSession) && this._currentSession.item.matches(item)) {
            Log.debug('Session already exists for %o, triggering start action instead', item);
            return this.start();
        }

        // Stop existing session
        if(isDefined(this._currentSession)) {
            Log.debug('Stopping existing session: %o', this._currentSession);
            this.stop();
        }

        // Ignore special episodes (and bonus content)
        // if(item instanceof Episode && (item.number === 0 || item.season.number === 0)) {
        //     Log.info('Ignoring special episode: %o', item);
        //     this._currentSession = null;
        //
        //     return Promise.resolve();
        // }

        // Retrieve metadata, and create session
        return Promise.resolve(() => {
            if(!isDefined(this.options.getMetadata)) {
                return true;
            }

            return Promise.resolve(this.options.getMetadata(item)).catch((err) => {
                Log.error('Unable to get metadata: %s', item, err.message, err);
            });
        }).then(() => {
            // Create session
            this._currentSession = Session.create(item, {
                clientId: this.messaging.client.id
            });

            // Emit "created" event
            this.messaging.emit('activity.created', this._currentSession.toPlainObject());
        });
    }

    created(payload) {
        let session = Session.fromPlainObject(payload);

        // Ensure session is valid
        if(!isDefined(session)) {
            Log.warn('Unable to parse session: %o', payload);
            return;
        }

        // Refresh metadata (if expired), and set current session
        this._refreshItem(session.item).then(() => {
            Log.debug('Created session: %o', session);

            // Update current session
            this._currentSession = session;
        });
    }

    updated(payload) {
        let session = Session.fromPlainObject(payload);

        // Ensure session is valid
        if(!isDefined(session)) {
            Log.warn('Unable to parse session: %o', payload);
            return;
        }

        Log.debug('Updated session: %o', session);

        // Update current session
        this._currentSession = session;
    }

    load(item) {
        // Reset state if the current session isn't valid
        if(this._currentSession && !this._currentSession.valid) {
            this._currentSession = null;
        }

        // Ensure session has been created
        if(!isDefined(this._currentSession)) {
            return this.create(item);
        }

        return false;
    }

    // region Player

    open(item) {
        Log.trace('Player opened (item: %o)', item);

        // Ignore stop action if there is currently no active session
        if(!isDefined(this._currentSession) || !isDefined(this._currentSession.item)) {
            Log.trace('No active session, ignoring open action');
            return false;
        }

        // Ignore stop action if the item matches the current session
        if(this._currentSession.valid && this._currentSession.item.matches(item)) {
            Log.debug('Session item matches, ignoring close action');
            return false;
        }

        // Trigger stop action
        return this.stop();
    }

    close(item) {
        Log.trace('Player closed (item: %o)', item);

        if(!isDefined(this._currentSession) || !isDefined(this._currentSession.item)) {
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

        if(!isDefined(this._currentSession)) {
            Log.trace('No active session, ignoring start action');
            return false;
        }

        if(this._currentSession.state === SessionState.playing) {
            Log.debug('Session has already been started');
            return false;
        }

        // Ensure progress is available
        if(!isDefined(this._currentSession.progress)) {
            if(!isDefined(this._currentSession.item)) {
                return this.error('Unable to calculate session progress, no item available');
            }

            if(!isDefined(this._currentSession.item.duration)) {
                return this.error('Unable to calculate session progress, no duration defined');
            }

            return this.error('Unable to calculate session progress');
        }

        // Switch back to previous stalled state
        if(this._currentSession.state === SessionState.stalled) {
            // Update session state
            this._currentSession.state = isDefined(this._currentSession.stalledPreviousState) ?
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

        if(!isDefined(this._currentSession)) {
            Log.trace('No active session, ignoring progress action');
            return false;
        }

        if(this._currentSession.state === SessionState.ended) {
            return false;
        }

        // Detect current activity state (based on changes in watched time)
        let state = this._detectState(time);

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

        if(!isDefined(this._currentSession)) {
            Log.trace('No active session, ignoring seek action');
            return false;
        }

        // Ensure session hasn't ended
        if(this._currentSession.state === SessionState.ended) {
            return false;
        }

        // Trigger start action if the session hasn't been started yet
        if(this._currentSession !== SessionState.playing) {
            return this.start();
        }

        // Emit "seeked" event (if session is valid)
        if(this._currentSession.valid) {
            this.messaging.emit('activity.seeked', this._currentSession.toPlainObject());
        }

        return true;
    }

    stateChange(previous, current) {
        Log.trace('Media state changed: %o -> %o', previous, current);

        if(!isDefined(this._currentSession)) {
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

        if(!isDefined(this._currentSession)) {
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
            if(!isDefined(this._currentSession) || this._currentSession.state !== SessionState.pausing) {
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

        if(!isDefined(this._currentSession)) {
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

        if(!isDefined(this._currentSession) || this._currentSession.state === SessionState.ended) {
            return false;
        }

        // Update state
        this._currentSession.state = SessionState.ended;
        this._currentSession.endedAt = Date.now();

        return true;
    }

    // endregion

    // region Private methods

    _cancelPause() {
        if(!isDefined(this._pauseTimeout)) {
            return false;
        }

        // Cancel timer
        clearTimeout(this._pauseTimeout);

        // Reset state
        this._pauseTimeout = null;
        return true;
    }

    _clearStalledState() {
        if(!isDefined(this._currentSession)) {
            return false;
        }

        this._currentSession.stalledAt = null;
        this._currentSession.stalledPreviousState = null;

        return true;
    }

    _detectState(time) {
        if(!isDefined(this._currentSession.time)) {
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

    _refreshItem(item) {
        if(!isDefined(this.options.fetchMetadata)) {
            return Promise.resolve();
        }

        if(isDefined(item.fetchedAt)) {
            Log.trace('Item fetched %d second(s) ago', (Date.now() - item.fetchedAt) / 1000);
        }

        // Fetch metadata (if the item is incomplete, or has expired)
        if(!item.complete || item.hasExpired(this.options.metadataRefreshInterval)) {
            return Promise.resolve(this.options.fetchMetadata(item)).catch((err) => {
                Log.error('Unable to fetch metadata for item %o: %s', item, err.message, err);
            });
        }

        return Promise.resolve();
    }

    _shouldEmitProgress() {
        return (
            !isDefined(this._progressEmittedAt) ||
            Date.now() - this._progressEmittedAt > this.options.progressInterval
        );
    }

    // endregion
}
