import IsNil from 'lodash-es/isNil';

import {Option} from './Core/Base';
import {getProperty} from './Core/Helpers';


export default class InputOption extends Option {
    get cleanValue() {
        return this.options.cleanValue;
    }

    get minLength() {
        return this.options.minLength;
    }

    get maxLength() {
        return this.options.maxLength;
    }

    get pattern() {
        return this.options.pattern;
    }

    get() {
        return this.preferences.getString(this.name);
    }

    isValid(value) {
        if(IsNil(value) || value.length === 0) {
            return true;
        }

        // Minimum Length
        if(!IsNil(this.minLength) && value.length < this.minLength) {
            return false;
        }

        // Maximum Length
        if(!IsNil(this.maxLength) && value.length > this.maxLength) {
            return false;
        }

        // RegExp Pattern
        if(!IsNil(this.pattern) && IsNil(RegExp(this.pattern).exec(value))) {
            return false;
        }

        return true;
    }

    put(value) {
        return this.preferences.putString(this.name, this.cleanValue(value));
    }

    _parseOptions(options) {
        return {
            ...super._parseOptions(options),

            cleanValue: getProperty(options, 'cleanValue', (value) => value),

            minLength: getProperty(options, 'minLength', getProperty(options, 'length'), null),
            maxLength: getProperty(options, 'maxLength', getProperty(options, 'length'), null),

            pattern: getProperty(options, 'pattern', null)
        };
    }
}

export class PasswordOption extends InputOption {
    constructor(plugin, name, options) {
        super(plugin, 'password', name, options);
    }
}

export class TextOption extends InputOption {
    constructor(plugin, name, options) {
        super(plugin, 'text', name, options);
    }
}
