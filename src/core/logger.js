/* eslint-disable no-multi-spaces, key-spacing */
import {isDefined, isFunction} from 'eon.extension.framework/core/helpers';

const Levels = {
    Error:   60,   error: 60,
    Warning: 50, warning: 50,
    Notice:  40,  notice: 40,
    Info:    30,    info: 30,
    Debug:   20,   debug: 20,
    Trace:   10,   trace: 10
};

const LevelKeys = {
    60: 'error',
    50: 'warning',
    40: 'notice',
    30: 'info',
    20: 'debug',
    10: 'trace'
};


export class Logger {
    constructor(resolver) {
        if(!isDefined(resolver)) {
            throw new Error('Missing required "resolver" parameter');
        }

        this._resolver = resolver;

        this._level = null;
        this._queue = [];

        // Setup queued logger methods
        this.error =   this._queueMessage.bind(this, Levels.Error);
        this.warning = this._queueMessage.bind(this, Levels.Warning);
        this.warn =    this._queueMessage.bind(this, Levels.Warning);
        this.notice =  this._queueMessage.bind(this, Levels.Notice);
        this.info =    this._queueMessage.bind(this, Levels.Info);
        this.debug =   this._queueMessage.bind(this, Levels.Debug);
        this.trace =   this._queueMessage.bind(this, Levels.Trace);

        // Refresh logger level with resolver
        setTimeout(this.refresh.bind(this), 0);
    }

    get level() {
        if(!isDefined(this._level)) {
            return null;
        }

        return LevelKeys[this._level];
    }

    refresh() {
        return this._resolveLevel().then((level) => {
            return this._enable(level);
        });
    }

    // region Static methods

    static create(key, resolver) {
        // Ensure `window.eon.loggers` object exists
        if(!isDefined(window.eon)) {
            window.eon = {};
        }

        if(!isDefined(window.eon.loggers)) {
            window.eon.loggers = {};
        }

        // Construct logger (if not already defined)
        if(!isDefined(window.eon.loggers[key])) {
            window.eon.loggers[key] = new Logger(resolver);
        }

        return window.eon.loggers[key];
    }

    // endregion

    // region Private methods

    _enable(level) {
        // Update current logger level
        this._level = level;

        // Write queued messages to console
        this._writeQueue();

        // Bind logger methods
        this.error =   this._bindFunction(Levels.Error);
        this.warning = this._bindFunction(Levels.Warning);
        this.warn =    this._bindFunction(Levels.Warning);
        this.notice =  this._bindFunction(Levels.Notice);
        this.info =    this._bindFunction(Levels.Info);
        this.debug =   this._bindFunction(Levels.Debug);
        this.trace =   this._bindFunction(Levels.Trace);
    }

    _bindFunction(level) {
        if(level < this._level) {
            return function() {};
        }

        let func = this._getFunction(level);

        if(!isDefined(func)) {
            return console.log.bind(console);
        }

        return func.bind(console);
    }

    _resolveLevel() {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            let get = () => {
                // Get current resolver
                let resolver;

                if(isFunction(this._resolver)) {
                    resolver = Promise.resolve(this._resolver());
                } else {
                    resolver = Promise.resolve(this._resolver);
                }

                // Try resolve log level
                resolver.then((key) => {
                    if(key === null) {
                        // Retry log level resolution
                        if(attempts < 50) {
                            attempts += 1;
                            setTimeout(get, 20);
                            return;
                        }

                        // Unable to resolve log level
                        console.warn('Unable to resolve current log level, will use "trace" instead');
                        resolve(Levels.Trace);
                        return;
                    }

                    // Ensure log level exists
                    if(!isDefined(Levels[key])) {
                        console.warn('Unknown log level: %o', key);
                        resolve(Levels.Trace);
                        return;
                    }

                    // Valid log level found
                    resolve(Levels[key]);
                }, (err) => {
                    reject(err);
                });
            };

            // Attempt level resolution
            get();
        });
    }

    _getFunction(level) {
        if(level === Levels.Error) {
            return window.console.error;
        }

        if(level === Levels.Warning) {
            return window.console.warn;
        }

        if(level === Levels.Notice) {
            return window.console.info;
        }

        if(level === Levels.Info) {
            return window.console.log;
        }

        if(level === Levels.Debug || level === Levels.Trace) {
            return window.console.debug;
        }

        throw new Error('Unknown level: ' + level);
    }

    _queueMessage(level, message) {
        this._queue.push({
            level: level,
            message: message,
            arguments: Array.from(arguments).slice(2)
        });
    }

    _writeQueue() {
        while(this._queue.length > 0) {
            let item = this._queue.shift();

            // Ensure message level has been enabled
            if(item.level < this._level) {
                continue;
            }

            // Retrieve console logger method
            let func = this._getFunction(item.level);

            if(!isDefined(func)) {
                func = console.log;
            }

            // Write message
            func.apply(console, [item.message].concat(item.arguments));
        }
    }

    // endregion
}

// Construct core/framework logger
export default Logger.create('eon.extension', () => new Promise((resolve) => {
    // Import preferences shim
    let preferences = require('eon.extension.browser/preferences').default;

    if(!isDefined(preferences)) {
        console.debug('Preferences not available yet');
        resolve(null);
        return;
    }

    // Try retrieve current log level
    preferences.context('eon.extension')
        .getString('general.developer.log_level')
        .then(resolve, (err) => {
            console.debug('Unable to retrieve preference value:', err);
            resolve(null);
        });
}));
