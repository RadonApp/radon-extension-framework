import {isDefined} from 'eon.extension.framework/core/helpers';

import {Models, EventMessage} from '../models';


export default class MessageParser {
    static parse(data) {
        // Verify message structure
        if(!isDefined(data)) {
            console.warn('Invalid value provided for the "data" parameter');
            return null;
        }

        if(!isDefined(data.resource)) {
            console.warn('Invalid value provided for the "data.resource" parameter');
            return null;
        }

        if(!isDefined(data.name)) {
            console.warn('Invalid value provided for the "data.name" parameter');
            return null;
        }

        // Parse event messages
        if(data.type === 'event') {
            return EventMessage.parse(data);
        }

        // Check if message model exists
        if(!isDefined(Models[data.resource])) {
            console.warn('Unsupported message resource: %o', data.resource);
            return null;
        }

        if(!isDefined(Models[data.resource][data.name])) {
            console.warn('Unsupported message name: %o', data.name);
            return null;
        }

        // Parse message with model
        return Models[data.resource][data.name].parse(data);
    }
}
