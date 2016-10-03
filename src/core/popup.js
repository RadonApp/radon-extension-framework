import {WindowMessaging} from '../messaging/window';

import merge from 'lodash-es/merge';
import uuid from 'uuid';

const WINDOW_FEATURES = [
    'width',
    'height',
    'left',
    'top'
];


export default class Popup {
    constructor(name, handle) {
        this.name = name;
        this.handle = handle;

        this.messaging = new WindowMessaging(name, handle);
    }

    static open(url, target, options) {
        options = typeof options !== 'undefined' ? options : {};

        // Set `options` defaults
        options = merge({
            position: null,
            width: 500,
            height: 500,
            left: 0,
            top: 0,

            offsetLeft: 0,
            offsetTop: 0,

            timeout: 5 * 60
        }, options);

        // Process "position" option
        if(options.position === 'center') {
            delete options['position'];

            options.left = window.screenLeft + (window.outerWidth / 2) - (options.width / 2) + options.offsetLeft;
            options.top = window.screenTop + options.offsetTop;
        }

        // Construct popup promise
        return new Promise(function(resolve, reject) {
            let name = 'eon.popup/' + uuid.v4();
            let features = Popup._buildFeaturesString(options);

            console.debug('Opening popup %o (name: %o, features: %o)', url, name, features);

            // Open empty popup, then navigate to `url` (note: fixes `window.opener` bug in chrome)
            let handle = window.open('', name, features);

            handle.location.href = url;

            // Move to position
            handle.moveTo(options.left, options.top);

            // Construct popup
            let popup = new Popup(name, handle);
            let done = false;

            // Bind to messaging events
            popup.messaging.on('resolve', (result) => {
                done = true;

                // Close window
                handle.close();

                // Resolve promise
                resolve(result);
            });

            popup.messaging.on('reject', (message) => {
                done = true;

                // Remove popup event listeners
                popup.messaging.removeAllListeners();

                // Reject promise
                reject(new Error(message));
            });

            // Watch for window closes
            function checkPopupClosed() {
                if(done) {
                    return;
                }

                console.debug('Checking if the popup has been closed...');

                if(handle.closed) {
                    done = true;

                    // Remove popup event listeners
                    popup.messaging.removeAllListeners();

                    // Reject promise
                    reject(new Error('Popup closed'));
                }

                setTimeout(checkPopupClosed, 2000);
            }

            setTimeout(checkPopupClosed, 5000);

            // Start timeout callback
            setTimeout(() => {
                if(done) {
                    return;
                }

                done = true;

                // Remove popup event listeners
                popup.messaging.removeAllListeners();

                // Ensure popup has been closed
                if(!handle.closed) {
                    handle.close();
                }

                // Reject promise
                reject(new Error('Popup timed out, response wasn\'t returned in ' + options.timeout + ' second(s)'));
            }, options.timeout * 1000);
        });
    }

    static _buildFeaturesString(features) {
        let keys = Object.keys(features);
        let fragments = [];

        for(let i = 0; i < keys.length; ++i) {
            let key = keys[i];

            if(WINDOW_FEATURES.indexOf(key) === -1) {
                continue;
            }

            fragments.push(key + '=' + features[key]);
        }

        return fragments.join(',');
    }
}
