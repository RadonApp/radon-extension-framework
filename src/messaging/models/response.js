import Message from './base';


export default class ResponseMessage extends Message {
    constructor(payload) {
        super(payload);
    }
}

ResponseMessage.messageType = 'response';
