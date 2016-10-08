import {isDefined} from 'eon.extension.framework/core/helpers';
import RequestMessage from '../base';


export default class ConnectMessage extends RequestMessage {
    constructor(channelId) {
        super();

        this.channelId = channelId;
    }

    get payload() {
        return {
            channelId: this.channelId
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

        if(!isDefined(data.payload.channelId)) {
            throw new Error('Invalid value provided for "data.payload.channelId"');
        }

        // Construct message
        return new ConnectMessage(
            data.payload.channelId
        );
    }
}

ConnectMessage.messageResource = 'channel';
ConnectMessage.messageName = 'connect';
