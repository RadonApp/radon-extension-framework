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
    constructor(resolver, defaultLevel) {
        if(!isDefined(resolver)) {
            throw new Error('Missing required "resolver" parameter');
        }

        this._resolver = resolver;

        this._level = null;

        // Bind logger methods (with default level)
        this._bind(defaultLevel || Levels.Trace);

        // Refresh logger level with resolver
        this.refresh();
    }

    get level() {
        if(!isDefined(this._level)) {
            return null;
        }

        return LevelKeys[this._level];
    }

    refresh() {
        return this._getLevel().then((level) => {
            return this._bind(level);
        });
    }

    // region Private methods

    _bind(level) {
        // Update current logger level
        this._level = level;

        // Bind logger methods
        this.error =   this._getFunction(Levels.Error, window.console.error);
        this.warning = this._getFunction(Levels.Warning, window.console.warn);
        this.warn =    this._getFunction(Levels.Warning, window.console.warn);
        this.notice =  this._getFunction(Levels.Notice, window.console.info);
        this.info =    this._getFunction(Levels.Info, window.console.log);
        this.debug =   this._getFunction(Levels.Debug, window.console.debug);
        this.trace =   this._getFunction(Levels.Trace, window.console.debug);
    }

    _getFunction(level, func) {
        if(level < this._level) {
            return function() {};
        }

        if(!isDefined(func)) {
            return console.log.bind(console);
        }

        return func.bind(console);
    }

    _getLevel() {
        // Resolve level
        let resolver;

        if(isFunction(this._resolver)) {
            resolver = Promise.resolve(this._resolver());
        } else {
            resolver = Promise.resolve(this._resolver);
        }

        // Map level to integer
        return resolver.then((key) => {
            if(!isDefined(Levels[key])) {
                console.warn('Unknown log level: %o', key);
                return Levels.Trace;
            }

            return Levels[key];
        })
    }

    // endregion
}
