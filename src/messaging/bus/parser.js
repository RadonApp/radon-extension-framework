import Log from 'eon.extension.framework/core/logger';
import {isDefined} from 'eon.extension.framework/core/helpers';

import {
    Models,
    EventMessage,
    RequestMessage,
    ResponseMessage
} from '../models';


export default class MessageParser {
    static parse(data) {
        // Verify message structure
        if(!isDefined(data)) {
            Log.warn('Invalid value provided for the "data" parameter');
            return null;
        }

        if(!isDefined(data.resource)) {
            Log.warn('Invalid value provided for the "data.resource" parameter');
            return null;
        }

        if(!isDefined(data.name)) {
            Log.warn('Invalid value provided for the "data.name" parameter');
            return null;
        }

        // Parse event messages
        if(data.type === 'event') {
            return EventMessage.parse(data);
        }

        // Check if message model exists
        if(isDefined(Models[data.type]) && isDefined(Models[data.type][data.resource])) {
            // Parse message with model (if available)
            let model = Models[data.type][data.resource][data.name];

            if(isDefined(model)) {
                return model.parse(data);
            }
        }

        Log.debug('No model available for message: %o', data);

        // Try parse with basic models
        if(data.type === 'request') {
            return RequestMessage.parse(data);
        }

        if(data.type === 'response') {
            return ResponseMessage.parse(data);
        }

        Log.warn('Unsupported message type: %o', data.type);
        return null;
    }
}
