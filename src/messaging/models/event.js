import {isDefined} from 'eon.extension.framework/core/helpers';

import Message from './base';


export default class EventMessage extends Message {
    constructor(resource, name, args, options) {
        super();

        this._resource = resource;
        this._name = name;

        this._args = args;
        this._options = options || {};
    }

    get resource() {
        return this._resource;
    }

    get name() {
        return this._name;
    }

    get id() {
        return this._resource + '.' + this._name;
    }

    get args() {
        return this._args;
    }

    get options() {
        return this._options;
    }

    get payload() {
        return this._args;
    }

    dump() {
        let data = super.dump();

        // Include extra options
        data.options = this._options;

        return data;
    }

    static parse(data) {
        if(!isDefined(data)) {
            throw new Error('Invalid value provided for "data", expected an object');
        }

        if(data.type !== this.message_type) {
            throw new Error('Message type mismatch (expected "' + this.message_type + '", got "' + data.type + '"');
        }

        // Construct message
        return new EventMessage(
            data.resource,
            data.name,

            data.payload,
            data.options
        );
    }
}

EventMessage.message_type = 'event';
