import {Messaging} from 'eon.extension.browser';

import EventEmitter from 'eventemitter3';
import util from 'util';


function Bus() {
    this.type = null;
}

util.inherits(Bus, EventEmitter);

Bus.prototype.configure = function(type) {
    this.type = type;

    // Initialize event bus
    this.initialize();
};

Bus.prototype.initialize = function() {
    console.log('Initializing event bus with type: %s', this.type);
    var self = this;

    if(this.type.indexOf('background/') === 0) {
        // Emit received messages to the event bus
        Messaging.addListener(function(message) {
            if(message.type !== 'bus') {
                return;
            }

            var args = [message.event].concat(
                message.arguments
            );

            // Emit message to the event bus
            Bus.super_.prototype.emit.apply(self, args);
        });
    }
};

Bus.prototype.emit = function(event, a1, a2, a3, a4, a5) {
    // Send messages to the background page
    this.send(event, Array.from(arguments).splice(1));

    // Fire event listeners
    Bus.super_.prototype.emit.apply(this, arguments);
};

Bus.prototype.send = function(event, args) {
    if(this.type === null || this.type.indexOf('background/') === 0) {
        console.log('Ignoring send() on event bus with type: %s', this.type);
        return;
    }

    // Cleanup event arguments
    var cleanedArgs = [];

    for(var i = 0; i < args.length; ++i) {
        var arg = args[i];

        if(typeof arg === 'undefined') {
            break;
        }

        cleanedArgs.push(arg);
    }

    // Build message
    var message = {
        type: 'bus',

        event: event,
        arguments: cleanedArgs
    };

    // Send message to background script
    console.log('Sending message to background script:', message);
    Messaging.send(message);
};

export default new Bus();
