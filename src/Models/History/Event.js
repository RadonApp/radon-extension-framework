import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';
import Omit from 'lodash-es/omit';
import Pick from 'lodash-es/pick';


export default class HistoryEvent {
    constructor(itemId, timestamp) {
        this.itemId = itemId;
        this.timestamp = timestamp;
    }

    get id() {
        return this.timestamp + '/' + this.itemId;
    }

    toDocument(options) {
        options = Merge({
            keys: {}
        }, options || {});

        // Validate options
        if(!IsNil(options.keys.include) && !IsNil(options.keys.exclude)) {
            throw new Error('Only one key filter should be defined');
        }

        // Build document
        let document = {
            '_id': this.id
        };

        // Apply key exclude filter
        if(!IsNil(options.keys.exclude)) {
            return Omit(document, options.keys.exclude);
        }

        // Apply key include filter
        if(!IsNil(options.keys.include)) {
            return Pick(document, options.keys.include);
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
