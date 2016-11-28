/* eslint-disable no-multi-spaces, key-spacing */
import Log from 'eon.extension.framework/core/logger';
import Session, {SessionState} from 'eon.extension.framework/models/session';
import EpisodeIdentifier from 'eon.extension.framework/models/video/identifier/episode';
import {isDefined} from 'eon.extension.framework/core/helpers';

import merge from 'lodash-es/merge';


export default class ActivityEngine {
    constructor(plugin, bus, options) {
        this.plugin = plugin;
        this.bus = bus;

        // Parse options, and set defaults
        this.options = merge({
            progressInterval: 5000,

            getDuration: null,
            getMetadata: null,

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

        // Player
        emitter.on('opened',    this.open.bind(this));
        emitter.on('closed',    this.close.bind(this));

        // Video
        emitter.on('started',   this.start.bind(this));
        emitter.on('progress',  this.progress.bind(this));
        emitter.on('seeked',    this.seek.bind(this));
        emitter.on('paused',    this.pause.bind(this));
        emitter.on('stopped',   this.stop.bind(this));
    }

    create(identifier) {
        Log.trace('Creating session (identifier: %o)', identifier);

        // Check if session has already been created
        if(isDefined(this._currentSession) && this._currentSession.identifier.matches(identifier)) {
            Log.debug('Session already exists for %o, triggering start action instead', identifier);
            return this.start();
        }

        // Ensure callback has been defined
        if(!isDefined(this.options.getMetadata)) {
            return Promise.reject(new Error(
                'Unable to create session, "getMetadata" callback hasn\'t been defined'
            ));
        }

        // Stop existing session
        if(isDefined(this._currentSession)) {
            Log.debug('Stopping existing session: %o', this._currentSession);
            this.stop();
        }

        // Ignore special episodes (and bonus content)
        if(identifier instanceof EpisodeIdentifier && (identifier.number === 0 || identifier.season.number === 0)) {
            Log.info('Ignoring special episode: %o', identifier);
            this._currentSession = null;

            return Promise.resolve();
        }

        // Retrieve actual player duration
        let duration = null;

        if(isDefined(this.options.getDuration)) {
            duration = this.options.getDuration();
        } else {
            Log.warn('No "getDuration" method has been defined');
        }

        // Create session
        return Promise.resolve(this.options.getMetadata(identifier)).then((metadata) => {
            // Construct session
            this._currentSession = Session.create(this.plugin, {
                // Channel identifier
                channelId: this.bus.id,

                // Video properties
                duration: duration,

                // Children
                identifier: identifier,
                metadata: metadata,

                // Current state
                state: SessionState.created
            });

            // Emit "created" event (if session is valid)
            if(this._currentSession.valid) {
                this.bus.emit('activity.created', this._currentSession.dump());
            }
        });
    }

    // region Player

    open(identifier) {
        Log.trace('Player opened (identifier: %o)', identifier);

        // Ignore stop action if there is currently no active session
        if(!isDefined(this._currentSession) || !isDefined(this._currentSession.identifier)) {
            Log.trace('No active session, ignoring open action');
            return false;
        }

        // Ignore stop action if the identifier matches the current session
        if(this._currentSession.valid && this._currentSession.identifier.matches(identifier)) {
            Log.debug('Session identifier matches, ignoring close action');
            return false;
        }

        // Trigger stop action
        return this.stop();
    }

    close(identifier) {
        Log.trace('Player closed (identifier: %o)', identifier);

        if(!isDefined(this._currentSession) || !isDefined(this._currentSession.identifier)) {
            Log.debug('No active session, ignoring close action');
            return false;
        }

        if(!this._currentSession.identifier.matches(identifier)) {
            Log.debug('Session identifier doesn\'t match, ignoring close action');
            return false;
        }

        // Trigger stop action
        return this.stop();
    }

    // endregion

    // region Video

    start() {
        Log.trace('Video started');

        if(!this.enabled) {
            Log.trace('Activity engine is not enabled, ignoring start action');
            return false;
        }

        if(this._currentSession === null) {
            Log.debug('No active session, ignoring start action');
            return false;
        }

        if(this._currentSession.state === SessionState.playing) {
            Log.debug('Session has already been started');
            return false;
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

        // Ensure progress is available
        if(this._currentSession.progress === null) {
            Log.trace('No progress available');
            return false;
        }

        // Update state
        this._currentSession.state = SessionState.playing;

        // Emit "started" event (if session is valid)
        if(this._currentSession.valid) {
            this.bus.emit('activity.started', this._currentSession.dump());
        }

        return true;
    }

    progress(time, duration) {
        Log.trace('Video progress (time: %o, duration: %o)', time, duration);

        if(!this.enabled) {
            Log.trace('Activity engine is not enabled, ignoring progress action');
            return false;
        }

        if(isNaN(time) || isNaN(duration)) {
            Log.info('Ignoring invalid progress action');
            return false;
        }

        if(this._currentSession === null) {
            Log.debug('No active session, ignoring progress action');
            return false;
        }

        if(this._currentSession.state === SessionState.ended) {
            return false;
        }

        // Detect current activity state (based on changes in watched time)
        let state = this._detectState(time);

        // Add new time sample
        this._currentSession.samples.push(time);

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
            Log.info('Video has reached 100% progress, stopping the session');
            return this.stop();
        }

        // Emit "progress" event (if session is valid)
        if(this._currentSession.valid) {
            this.bus.emit('activity.progress', this._currentSession.dump());
        }

        // Update progress emitted timestamp
        this._progressEmittedAt = Date.now();
        return true;
    }

    seek(time, duration) {
        Log.trace('Video seeked (time: %o, duration: %o)', time, duration);

        if(!this.enabled) {
            Log.trace('Activity engine is not enabled, ignoring seek action');
            return false;
        }

        if(isNaN(time) || isNaN(duration)) {
            Log.info('Ignoring invalid seek action');
            return false;
        }

        if(this._currentSession === null) {
            Log.debug('No active session, ignoring seek action');
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
            this.bus.emit('activity.seeked', this._currentSession.dump());
        }

        return true;
    }

    stateChange(previous, current) {
        Log.trace('Video state changed: %o -> %o', previous, current);

        if(this._currentSession === null) {
            Log.debug('No active session, ignoring state change action');
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

        Log.debug('Unknown state transition: %o -> %o', previous, current);

        // Update state
        this._currentSession.state = current;
        return true;
    }

    pause() {
        Log.trace('Video paused');

        if(!this.enabled) {
            Log.trace('Activity engine is not enabled, ignoring pause action');
            return false;
        }

        if(this._currentSession === null) {
            Log.debug('No active session, ignoring pause action');
            return false;
        }

        if(this._currentSession.state === SessionState.paused) {
            Log.debug('Session has already been paused');
            return false;
        }

        // Ensure video isn't pausing
        if(this._currentSession.state === SessionState.pausing) {
            return false;
        }

        // Ensure video isn't already paused
        if(this._currentSession.state === SessionState.paused) {
            return false;
        }

        // Update state
        this._currentSession.state = SessionState.pausing;

        // Emit "paused" event in 8000ms
        this._pauseTimeout = setTimeout(() => {
            if(this._currentSession === null || this._currentSession.state !== SessionState.pausing) {
                return;
            }

            // Update state
            this._currentSession.state = SessionState.paused;

            // Emit event (if session is valid)
            if(this._currentSession.valid) {
                this.bus.emit('activity.paused', this._currentSession.dump());
            }
        }, 8000);

        return true;
    }

    stop() {
        Log.trace('Video stopped');

        // Ensure session exists
        if(this._currentSession === null) {
            Log.debug('No active session, ignoring stop action');
            return false;
        }

        // Ensure session hasn't already ended
        if(this._currentSession.state === SessionState.ended) {
            Log.debug('Session has already been stopped');
            return false;
        }

        // Retrieve latest state
        let state = this._currentSession.state;

        if(state === SessionState.stalled) {
            state = this._currentSession.stalledPreviousState;
        }

        // Ensure session was actually started
        if(state === SessionState.ended || state === SessionState.created) {
            Log.debug('Session hasn\'t been started yet, ignoring stop action');
            return false;
        }

        // Update state
        this._currentSession.state = SessionState.ended;

        // Emit event (if session is valid)
        if(this._currentSession.valid) {
            this.bus.emit('activity.stopped', this._currentSession.dump());
        }

        return true;
    }

    // endregion

    // region Private methods

    _cancelPause() {
        if(this._pauseTimeout === null) {
            return false;
        }

        // Cancel timer
        clearTimeout(this._pauseTimeout);

        // Reset state
        this._pauseTimeout = null;
        return true;
    }

    _clearStalledState() {
        if(this._currentSession == null) {
            return false;
        }

        this._currentSession.stalledAt = null;
        this._currentSession.stalledPreviousState = null;
        return true;
    }

    _detectState(time) {
        if(this._currentSession.time === null) {
            return null;
        }

        if(time > this._currentSession.time) {
            // Clear stalled state
            this._clearStalledState();

            // Progress changed
            return SessionState.playing;
        }

        // Ignore the paused and pausing states
        if(this._currentSession.state === SessionState.paused ||
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

    _shouldEmitProgress() {
        return (
            this._progressEmittedAt === null ||
            Date.now() - this._progressEmittedAt > this.options.progressInterval
        );
    }

    // endregion
}
