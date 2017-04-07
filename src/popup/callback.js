import Messaging from 'eon.extension.browser/messaging';
import Storage from 'eon.extension.browser/storage';
import MessagingBus from 'eon.extension.framework/messaging/bus';
import {isDefined} from 'eon.extension.framework/core/helpers';


export default class PopupCallbackHandler {
    constructor(plugin) {
        this.plugin = plugin;
    }

    resolve(value) {
        return this._sendResponse('popup.resolve', value);
    }

    reject(message) {
        return this._sendResponse('popup.reject', message);
    }

    // region Private methods

    _getCallbackId() {
        if(window.name.indexOf('eon.popup/') === 0) {
            return Promise.resolve(window.name);
        }

        return Storage.getString(this.plugin.id + ':authentication.latestPopupId')
            .then((callbackId) =>
                'eon.popup/' + callbackId
            );
    }

    _sendResponse(type, value) {
        // Try send response via message bus
        return this._sendBusResponse(type, value)
            .catch((err) => {
                console.warn('Unable to send response via message bus, error:', err.message);

                // Fallback to sending response via window messaging
                return this._sendWindowResponse(type, value);
            })
            .then(() => {
                window.close();
            });
    }

    _sendBusResponse(type, value) {
        return this._getCallbackId().then((callbackId) => {
            // Ensure messaging is available
            if(!Messaging.available) {
                return Promise.reject(new Error('Extension messaging is not available'));
            }

            // Connect to relay messaging bus
            console.info('Connecting to message bus...');

            let bus = new MessagingBus(callbackId + '/callback').connect(
                'eon.extension.core:relay'
            );

            // Emit response event
            bus.relay(callbackId, type, value);

            // Disconnect messaging bus
            console.info('Response sent, disconnecting from message bus..');
            bus.disconnectAll();
            return true;
        });
    }

    _sendWindowResponse(type, value) {
        return this._getCallbackId().then((callbackId) => {
            // Try retrieve opener reference
            let parent = (window.opener || window.parent);

            if(!isDefined(parent)) {
                return Promise.reject(new Error('Window messaging is not available'));
            }

            // Construct message
            let message = {
                type: type,
                callbackId: callbackId,
                value: value
            };

            // Send message to parent window
            parent.postMessage(message, window.location.origin);
            return true;
        });
    }

    // endregion
}
