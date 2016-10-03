import {Messaging} from 'eon.extension.browser';

import EventEmitter from 'eventemitter3';


class Bus extends EventEmitter {
    constructor() {
        super();

        this.type = null;
    }

    configure(type) {
        this.type = type;

        // Initialize event bus
        this.initialize();
    }

    initialize() {
        if(this.type.indexOf('background/') === 0) {
            // Emit received messages to the event bus
            Messaging.addListener((message) => {
                // Verify message type
                if(typeof message.type === 'undefined' || message.type !== 'bus') {
                    console.warn('Received an invalid message:', message);
                    return;
                }

                // Build `emit()` arguments
                let args = [message.event].concat(
                    message.arguments
                );

                // Emit message to listeners
                super.emit.apply(this, args);
            });
        }

        console.debug('Initialized event bus (type: %o)', this.type);
    }

    emit(event, a1, a2, a3, a4, a5) {
        // Send messages to the background page
        this.send(event, Array.from(arguments).splice(1));

        // Fire event listeners
        super.emit.apply(this, arguments);
    }

    send(event, args) {
        if(this.type === null || this.type.indexOf('background/') === 0) {
            console.debug('Ignoring send() on event bus with type: %s', this.type);
            return;
        }

        // Cleanup event arguments
        let cleanedArgs = [];

        for(let i = 0; i < args.length; ++i) {
            let arg = args[i];

            if(typeof arg === 'undefined') {
                break;
            }

            cleanedArgs.push(arg);
        }

        // Build message
        let message = {
            type: 'bus',

            event: event,
            arguments: cleanedArgs
        };

        // Send message to background script
        console.debug('Sending message to background script: %O', message);
        Messaging.send(message);
    }
}

export default new Bus();
