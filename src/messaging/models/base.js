import {isDefined} from 'eon.extension.framework/core/helpers';


export default class Message {
    get type() {
        return this.constructor.message_type;
    }

    get resource() {
        return this.constructor.message_resource;
    }

    get name() {
        return this.constructor.message_name;
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

Message.message_type = null;
Message.message_resource = null;
Message.message_name = null;
