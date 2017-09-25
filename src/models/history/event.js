import Pick from 'lodash-es/pick';

import {isDefined} from 'neon-extension-framework/core/helpers';


export default class HistoryEvent {
    constructor(itemId, timestamp) {
        this.itemId = itemId;
        this.timestamp = timestamp;
    }

    get id() {
        return this.timestamp + '/' + this.itemId;
    }

    toDocument(options) {
        options = options || {};

        // Build document
        let document = {
            '_id': this.id
        };

        // Filter document by "keys"
        if(isDefined(options.keys)) {
            return Pick(document, options.keys);
        }

        return document;
    }

    static fromDocument(document) {
        // Split ID into parts
        let id = document['_id'].split('/');

        if(id.length !== 2) {
            throw new Error('Invalid identifier format');
        }

        // Construct event
        return new HistoryEvent(id[1], parseInt(id[0], 10));
    }
}
