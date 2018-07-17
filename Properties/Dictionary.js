import Every from 'lodash-es/every';
import ForEach from 'lodash-es/forEach';
import IsEqual from 'lodash-es/isEqual';
import IsFunction from 'lodash-es/isFunction';
import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';

import ValueProperty from './Value';
import {PropertyConflictError} from './Core/Exceptions';


export default class Dictionary extends ValueProperty {
    update(current, value) {
        if(IsNil(current)) {
            return value;
        }

        return Merge(current, value);
    }

    isEqual(a, b) {
        return IsEqual(a, b);
    }

    shouldCopyEncodedValue(items) {
        return (
            !IsNil(items) &&
            Object.keys(items).length > 0
        );
    }
}

export class Index extends Dictionary {
    apply(source, target, key, options) {
        let value = this.decode(source[this.getOption(options.format, 'key', key)], options);

        if(IsNil(value)) {
            return false;
        }

        // TODO Validate `value`

        // Ensure target exists
        if(IsNil(target[key])) {
            target[key] = {};
        }

        // Update keys
        let changed = false;

        ForEach(value, (keys, source) => {
            // Ensure target source exists
            if(IsNil(target[key][source])) {
                target[key][source] = {};
            }

            // Update source keys
            ForEach(keys, (value, name) => {
                let current = target[key][source][name];

                // Ensure value has changed
                if(IsNil(value) || this.isEqual(current, value)) {
                    return;
                }

                // Change Handler
                if(!IsNil(current) && !this.shouldChangeValue(current, value)) {
                    if(this.shouldMatch(source, name)) {
                        let message = (
                            `${key}[${JSON.stringify(source)}].${name}: ` +
                            `${JSON.stringify(value)} doesn't match ${JSON.stringify(current)}`
                        );

                        if(!IsNil(options.item)) {
                            throw new PropertyConflictError(`${options.item.constructor.name}.${message}`, {
                                property: key
                            });
                        }

                        throw new PropertyConflictError(message, {
                            property: key
                        });
                    }

                    return;
                }

                // Mark as changed
                changed = true;

                // Update value
                this.set(target[key][source], name, value);
            });
        });

        return changed;
    }

    shouldCopyEncodedValue(items) {
        return (
            !IsNil(items) &&
            Object.keys(items).length > 0 &&
            Every(items, (value) => Object.keys(value).length > 0)
        );
    }

    shouldMatch(source, name) {
        if(this.options.match === true) {
            return true;
        }

        if(IsFunction(this.options.match) && this.options.match(source, name)) {
            return true;
        }

        return false;
    }
}
