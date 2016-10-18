import {isDefined} from 'eon.extension.framework/core/helpers';

import MessageParser from '../../bus/parser';
import RequestMessage from '../request';


export default class RelayMessage extends RequestMessage {
    constructor(targetId, subject) {
        super();

        this._targetId = targetId;
        this._subject = subject;
    }

    get targetId() {
        return this._targetId;
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

        if(!isDefined(data.payload.targetId)) {
            throw new Error('Invalid value provided for "data.payload.targetId"');
        }

        if(!isDefined(data.payload.subject)) {
            throw new Error('Invalid value provided for "data.payload.subject"');
        }

        // Construct message
        return new RelayMessage(
            data.payload.targetId,
            MessageParser.parse(data.payload.subject)
        );
    }
}

RelayMessage.messageResource = 'channel';
RelayMessage.messageName = 'relay';
