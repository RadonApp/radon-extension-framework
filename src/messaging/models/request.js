import {isDefined} from 'eon.extension.framework/core/helpers';

import uuid from 'uuid';

import Message from './base';


export default class RequestMessage extends Message {
    constructor(payload, options) {
        super(payload, options);

        this.id = (options || {}).id || uuid.v4();
    }

    get type() {
        return 'request';
    }

    dump() {
        let result = super.dump();

        // Include request identifier
        result.id = this.id;

        return result;
    }

    static parse(data) {
        if(!isDefined(data)) {
            throw new Error('Invalid value provided for "data", expected an object');
        }

        if(!isDefined(data.resource)) {
            throw new Error('Invalid value provided for "data.resource"');
        }

        if(!isDefined(data.name)) {
            throw new Error('Invalid value provided for "data.name"');
        }

        if(data.type !== 'request') {
            throw new Error('Message type mismatch (expected "request", got "' + data.type + '"');
        }

        if(!isDefined(data.id)) {
            throw new Error('Invalid value provided for "data.id"');
        }

        if(!isDefined(data.payload)) {
            throw new Error('Invalid value provided for "data.payload"');
        }

        // Construct message
        return new RequestMessage(data.payload, {
            id: data.id,
            resource: data.resource,
            name: data.name
        });
    }
}

RequestMessage.messageType = 'request';
