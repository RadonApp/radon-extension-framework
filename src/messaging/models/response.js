import {isDefined} from 'eon.extension.framework/core/helpers';

import Message from './base';


export default class ResponseMessage extends Message {
    constructor(requestId, payload, options) {
        super(payload, options);

        this.requestId = requestId;
    }

    get type() {
        return 'response';
    }

    dump() {
        let result = super.dump();

        // Include request identifier
        result.requestId = this.requestId;

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

        if(data.type !== 'response') {
            throw new Error('Message type mismatch (expected "response", got "' + data.type + '"');
        }

        if(!isDefined(data.requestId)) {
            throw new Error('Invalid value provided for "data.requestId"');
        }

        if(!isDefined(data.payload)) {
            throw new Error('Invalid value provided for "data.payload"');
        }

        // Construct message
        return new ResponseMessage(data.requestId, data.payload, {
            resource: data.resource,
            name: data.name
        });
    }
}

ResponseMessage.messageType = 'response';
