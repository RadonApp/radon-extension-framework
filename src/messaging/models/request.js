import Message from './base';


export default class RequestMessage extends Message {
    constructor(payload) {
        super(payload);
    }
}

RequestMessage.message_type = 'request';
