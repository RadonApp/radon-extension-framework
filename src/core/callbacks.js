import {Storage} from 'eon.extension.browser';

import merge from 'lodash-es/merge';
import querystring from 'querystring';
import uuid from 'uuid';


export class Callbacks {
    create(plugin, type) {
        console.debug('register() plugin: %O', plugin);

        // Generate callback id
        let callbackId = uuid.v4();

        // Build hash
        let hash;

        if(plugin.type === 'destination') {
            hash = '#/destinations/' + plugin.id;
        } else if(plugin.type === 'source') {
            hash = '#/sources/' + plugin.id;
        } else {
            return Promise.reject(new Error('Unknown plugin type: "' + plugin.type + '"'));
        }

        // Storage callback details
        Storage.putObject('callback:' + callbackId, {
            pluginId: plugin.id,
            hash: hash,
            type: type
        });

        return callbackId;
    }

    get() {
        // Retrieve callback id
        let callback = this._getCallbackId();

        if(callback === null) {
            return Promise.resolve(null);
        }

        // Retrieve callback details
        return Storage.getObject('callback:' + callback.id).then(function(details) {
            if(details === null) {
                return null;
            }

            return merge(callback, details);
        });
    }

    remove() {
        // Retrieve callback id
        let callback = this._getCallbackId();

        if(callback === null) {
            return Promise.resolve(null);
        }

        // Remove callback from storage
        return Storage.remove('callback:' + callback.id);
    }

    _getCallbackId() {
        // Retrieve parameters
        let query = window.location.search;

        if(query.length < 2) {
            return null;
        }

        // Parse parameters
        let params;

        try {
            params = querystring.parse(query.substring(1));
        } catch(e) {
            console.warn('Unable to parse query: %o', query);
            return null;
        }

        // Retrieve callback id
        let callbackId = this._findCallbackId(params);

        if(callbackId === null) {
            console.warn('Unable to find callback id in params: %O', params);
            return null;
        }

        return {
            id: callbackId,
            params: params
        };
    }

    _findCallbackId(params) {
        if(typeof params.state !== 'undefined' && params.state.indexOf('callback:') === 0) {
            return params.state.substring(params.state.indexOf(':') + 1);
        }

        return null;
    }
}

export default new Callbacks();
