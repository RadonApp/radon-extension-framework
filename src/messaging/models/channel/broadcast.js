import {isDefined} from 'eon.extension.framework/core/helpers';

import MessageParser from '../../bus/parser';
import RequestMessage from '../request';


export default class BroadcastMessage extends RequestMessage {
    constructor(subject) {
        super();

        this._subject = subject;
    }

    get subject() {
        return this._subject;
    }

    get payload() {
        return {
            targetId: this._targetId,
            subject: isDefined(this._subject) ? this._subject.dump() : null
        };
    }

    static parse(data) {
        if(!isDefined(data)) {
            throw new Error('Invalid value provided for "data", expected an object');
        }

        if(data.type !== this.messageType) {
            throw new Error('Message type mismatch (expected "' + this.messageType + '", got "' + data.type + '"');
        }

        if(!isDefined(data.payload)) {
            throw new Error('Invalid value provided for "data.payload"');
        }

        if(!isDefined(data.payload.subject)) {
            throw new Error('Invalid value provided for "data.payload.subject"');
        }

        // Construct message
        return new BroadcastMessage(
            MessageParser.parse(data.payload.subject)
        );
    }
}

BroadcastMessage.messageResource = 'channel';
BroadcastMessage.messageName = 'broadcast';
