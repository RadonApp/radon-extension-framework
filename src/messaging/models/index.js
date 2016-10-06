import {isDefined} from 'eon.extension.framework/core/helpers';

import {default as _ChannelBroadcastMessage} from './channel/broadcast';
import {default as _ChannelConnectMessage} from './channel/connect';
import {default as _ChannelRelayMessage} from './channel/relay';

import {default as _EventMessage} from './event';
import {default as _RequestMessage} from './request';
import {default as _ResponseMessage} from './response';
import {default as _Message} from './base';


// Export models
export {_ChannelBroadcastMessage as ChannelBroadcastMessage};
export {_ChannelConnectMessage as ChannelConnectMessage};
export {_ChannelRelayMessage as ChannelRelayMessage};

export {_EventMessage as EventMessage};
export {_RequestMessage as RequestMessage};
export {_ResponseMessage as ResponseMessage};
export {_Message as Message};

// Export models list
export const ModelsList = [
    _ChannelBroadcastMessage,
    _ChannelConnectMessage,
    _ChannelRelayMessage
];

// Export models map
export const Models = {};

ModelsList.forEach((model) => {
    if(!isDefined(model.message_resource)) {
        console.warn('Model %o has an invalid "message_resource" property');
        return;
    }

    if(!isDefined(model.message_name)) {
        console.warn('Model %o has an invalid "message_name" property');
        return;
    }

    // Ensure resource object exists
    if(!isDefined(Models[model.message_resource])) {
        Models[model.message_resource] = {};
    }

    // Store model reference
    Models[model.message_resource][model.message_name] = model;
});
