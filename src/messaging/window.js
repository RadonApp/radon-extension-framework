import EventEmitter from 'eventemitter3';


export class WindowMessaging extends EventEmitter {
    constructor(name, target, origin) {
        super();

        this.name = name || window.name;
        this.target = target || window.opener || window.parent;
        this.origin = origin || window.location.origin;

        // Bind to messages
        window.addEventListener('message', (e) => {
            let message = e.data;

            // Verify message type
            if(typeof message.type === 'undefined' || message.type !== 'window') {
                console.warn('Received an invalid message:', message);
                return;
            }

            // Verify message matches popup `name`
            if(message.window.name !== this.name) {
                console.debug('Ignoring message %O doesn\'t match popup name: %s', message, this.name);
                return;
            }

            console.debug('[%s] Received message: %O', this.name, message);

            // Build `emit()` arguments
            let args = [message.event].concat(
                message.arguments
            );

            // Emit message to listeners
            super.emit.apply(this, args);
        });
    }

    emit(event, a1, a2, a3, a4, a5) {
        // Send messages to the background page
        this.send(event, Array.from(arguments).splice(1));

        // Fire event listeners
        super.emit.apply(this, arguments);
    }

    send(event, args) {
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
            type: 'window',

            window: {
                name: this.name
            },

            event: event,
            arguments: cleanedArgs
        };

        // Send message to background script
        console.debug('Sending message to %o: %O', message);
        this.target.postMessage(message, this.origin);
    }
}

export default new WindowMessaging();
