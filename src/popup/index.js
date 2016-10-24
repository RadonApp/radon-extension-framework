import Platform, {Platforms} from 'eon.extension.browser/platform';
import Log from 'eon.extension.framework/core/logger';
import MessagingBus from 'eon.extension.framework/messaging/bus';
import {isDefined} from 'eon.extension.framework/core/helpers';

import EventEmitter from 'eventemitter3';
import merge from 'lodash-es/merge';
import uuid from 'uuid';

const WindowFeatures = [
    'width',
    'height',
    'left',
    'top'
];


export default class Popup extends EventEmitter {
    constructor(name, url, options) {
        super();

        this.name = name;
        this.url = url;
        this.options = options;

        this.handle = null;

        this.resolved = false;
        this.rejected = false;

        // Set default options
        this.options = merge({
            position: null,
            width: 500,
            height: 500,
            left: 0,
            top: 0,

            offsetLeft: 0,
            offsetTop: 0,

            timeout: 5 * 60
        }, options || {});

        // Process "position" option
        if(this.options.position === 'center') {
            delete this.options['position'];

            this.options.left = (
                window.screenX + (window.outerWidth / 2) -
                (this.options.width / 2) + this.options.offsetLeft
            );

            this.options.top = window.screenY + this.options.offsetTop;
        }

        // Build window features string
        this._features = this._buildFeaturesString(this.options);

        // Bind to message bus events
        this._bus = new MessagingBus(name).connect(
            'eon.extension.core:relay'
        );

        this._bus.on('popup.resolve', this._onResolved.bind(this));
        this._bus.on('popup.reject', this._onRejected.bind(this));

        // Bind to window events
        this._windowMessageCallback = this._onWindowMessage.bind(this);

        window.addEventListener('message', this._windowMessageCallback);

        // Set supported parameters
        this._closeSupported = (
            Platform.name !== Platforms.Edge &&
            Platform.name !== Platforms.Firefox
        );

        // Start monitoring close state
        if(this._closeSupported) {
            setTimeout(this._checkClosed.bind(this), 5000);
        }

        // Start timeout trigger
        setTimeout(this._onTimeout.bind(this), this.options.timeout * 1000);
    }

    get closed() {
        if(!this._closeSupported) {
            return true;
        }

        return this.handle.closed;
    }

    get complete() {
        return this.resolved || this.rejected;
    }

    // region Public methods

    open() {
        Log.debug('Opening popup %o (name: %o, features: %o)', this.url, this.name, this._features);

        // Open popup window
        this.handle = window.open(this.url, this.name, this._features);

        // Move popup to specified position
        if(isDefined(this.handle)) {
            this.handle.moveTo(this.options.left, this.options.top);
        }

        // Create result promise
        return new Promise((resolve, reject) => {
            // Bind popup events to promise
            this.on('resolve', resolve);
            this.on('reject', reject);
        });
    }

    close() {
        if(!this._closeSupported) {
            return;
        }

        // Ensure popup has been closed
        try {
            this.handle.close();
        } catch(e) {
            Log.warn('Unable to close popup:', e);
        }
    }

    dispose() {
        this._onRejected('Popup has been disposed');

        // Ensure popup is closed
        this.close();

        // Remove window message event listener
        if(isDefined(this._windowMessageCallback)) {
            window.removeEventListener('message', this._windowMessageCallback);
        }

        // Remove message event listeners
        this._bus.removeAllListeners();

        // Disconnect messaging channels
        this._bus.disconnectAll();
    }

    // endregion

    // region Static methods

    static create(url, options) {
        options = merge({
            id: null
        }, options || {});

        // Create popup
        return new Popup(
            'eon.popup/' + (options.id || uuid.v4()),
            url,
            options
        );
    }

    static open(url, options) {
        // Open popup, and await result
        return Popup.create(url, options).open();
    }

    // endregion

    // region Private methods

    _checkClosed() {
        if(this.complete) {
            return;
        }

        Log.trace('Checking if popup has been closed...');

        if(this.closed) {
            // Popup rejected
            this._onRejected('Popup closed');
            return;
        }

        setTimeout(this._checkClosed.bind(this), 2000);
    }

    _onTimeout() {
        if(this.complete) {
            return;
        }

        // Popup rejected
        this._onRejected('Popup timed out, response wasn\'t returned in ' + this.options.timeout + ' second(s)');
    }

    _onResolved(result) {
        if(this.complete) {
            return;
        }

        this.resolved = true;

        // Ensure popup is closed
        this.close();

        // Dispose resources
        this.dispose();

        // Fire "resolved" event
        this.emit('resolve', result);
    }

    _onRejected(message) {
        if(this.complete) {
            return;
        }

        this.rejected = true;

        // Ensure popup is closed
        this.close();

        // Dispose resources
        this.dispose();

        // Fire "rejected" event
        this.emit('reject', new Error(message));
    }

    _onWindowMessage(e) {
        let message = e.data;

        if(!isDefined(message) || !isDefined(message.type)) {
            console.debug('Unknown message received:', message);
            return;
        }

        // Ensure message matches popup name
        if(message.callbackId !== this.name) {
            console.debug('Received message for an unknown popup:', message);
        }

        // Trigger event handlers
        if(message.type === 'popup.resolve') {
            this._onResolved(message.value);
        } else if(message.type === 'popup.reject') {
            this._onRejected(message.value);
        }
    }

    _buildFeaturesString(features) {
        let keys = Object.keys(features);
        let fragments = [];

        for(let i = 0; i < keys.length; ++i) {
            let key = keys[i];

            if(WindowFeatures.indexOf(key) === -1) {
                continue;
            }

            fragments.push(key + '=' + features[key]);
        }

        return fragments.join(',');
    }

    // endregion
}
