/* eslint-disable no-console, no-multi-spaces, key-spacing */
import IsNil from 'lodash-es/isNil';


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
    constructor(getPreferenceContext) {
        if(IsNil(getPreferenceContext)) {
            throw new Error('Missing required "resolver" parameter');
        }

        this._getPreferenceContext = getPreferenceContext;

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

        // Configure logger (in separate context)
        setTimeout(this._configure.bind(this), 0);
    }

    get level() {
        if(IsNil(this._level)) {
            return null;
        }

        return LevelKeys[this._level];
    }

    get preferences() {
        let preferences = require('neon-extension-framework/preferences').default;

        if(IsNil(preferences)) {
            return null;
        }

        return preferences;
    }

    // region Static methods

    static create(key, resolver) {
        // Ensure `window.neon.loggers` object exists
        if(IsNil(window.neon)) {
            window.neon = {};
        }

        if(IsNil(window.neon.loggers)) {
            window.neon.loggers = {};
        }

        // Construct logger (if not already defined)
        if(IsNil(window.neon.loggers[key])) {
            window.neon.loggers[key] = new Logger(resolver);
        }

        return window.neon.loggers[key];
    }

    // endregion

    // region Private methods

    _configure(attempt = 0) {
        let self = this;

        // Set to trace in development environments
        if(process.env['NODE_ENV'] === 'development') {
            this._setLevel('trace');
            return;
        }

        // Wait until preferences are available
        function retry() {
            if(attempt > 50) {
                console.warn('Unable to retrieve the current log level, defaulting to trace');
                self._setLevel(Levels.Trace);
                return;
            }

            // Retry in 50ms
            setTimeout(self._configure.bind(self, attempt + 1), 50);
        }

        if(IsNil(this.preferences)) {
            retry();
            return;
        }

        // Retrieve preference context
        let context = this._getPreferenceContext(this.preferences);

        if(IsNil(context) || !context.exists('log_level')) {
            this._setLevel(Levels.Trace);
            return;
        }

        // Subscribe to log level changes
        context.onChanged('log_level', ({value}) => {
            this._setLevel(value);
        });

        // Retrieve current log level
        context.getString('log_level').then(
            (level) => this._setLevel(level),
            () => retry()
        );
    }

    _setLevel(key) {
        // Update current logger level
        this._level = Levels[key];

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

        if(IsNil(func)) {
            return console.log.bind(console);
        }

        return func.bind(console);
    }

    _getFunction(level) {
        if(level === Levels.Error) {
            return console.error;
        }

        if(level === Levels.Warning) {
            return console.warn;
        }

        if(level === Levels.Notice) {
            return console.info;
        }

        if(level === Levels.Info) {
            return console.log;
        }

        if(level === Levels.Debug || level === Levels.Trace) {
            return console.debug;
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

            if(IsNil(func)) {
                func = console.log;
            }

            // Write message
            func.apply(console, [item.message].concat(item.arguments));
        }
    }

    // endregion
}

// Construct core/framework logger
export default Logger.create('neon-extension', (preferences) =>
    preferences.context('neon-extension:general:debugging')
);
