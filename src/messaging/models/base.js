import {NotImplementedError} from 'eon.extension.framework/core/exceptions';
import {isDefined} from 'eon.extension.framework/core/helpers';

import merge from 'lodash-es/merge';


export default class Message {
    constructor(payload, options) {
        this._payload = payload;

        this._options = merge({
            resource: null,
            name: null
        }, options);
    }

    get type() {
        throw new NotImplementedError();
    }

    get resource() {
        if(isDefined(this._options.resource)) {
            return this._options.resource;
        }

        return this.constructor.messageResource;
    }

    get name() {
        if(isDefined(this._options.name)) {
            return this._options.name;
        }

        return this.constructor.messageName;
    }

    get payload() {
        return this._payload;
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
