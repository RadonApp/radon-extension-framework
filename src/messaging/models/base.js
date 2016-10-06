export default class Message {
    get type() {
        return this.constructor.messageType;
    }

    get resource() {
        return this.constructor.messageResource;
    }

    get name() {
        return this.constructor.messageName;
    }

    get payload() {
        return null;
    }

    dump() {
        return {
            type: this.type,

            resource: this.resource,
            name: this.name,

            payload: this.payload
        };
    }
}

Message.messageType = null;
Message.messageResource = null;
Message.messageName = null;
