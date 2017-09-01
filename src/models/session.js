/* eslint-disable no-multi-spaces, key-spacing */
import Item from 'eon.extension.framework/models/item';
import {isDefined, round} from 'eon.extension.framework/core/helpers';

import uuid from 'uuid';


export const SessionState = {
    created:    'created',
    stalled:    'stalled',
    playing:    'playing',

    pausing:    'pausing',
    paused:     'paused',

    ended:      'ended'
};

export default class Session {
    constructor(id, item, options) {
        this.id = id;
        this.item = item || null;

        // Define optional properties
        options = options || {};

        this.channelId = options.channelId || null;

        this.state = options.state || SessionState.created;
        this.time = options.time || null;

        this.createdAt = options.createdAt || null;
        this.updatedAt = options.updatedAt || null;
        this.endedAt = options.endedAt || null;

        this.stalledAt = options.stalledAt || null;
        this.stalledPreviousState = options.stalledPreviousState || null;
    }

    get progress() {
        if(!isDefined(this.time)) {
            return null;
        }

        if(!isDefined(this.item) || !isDefined(this.item.duration)) {
            return null;
        }

        // Calculate session progress
        return round((this.time / this.item.duration) * 100, 2);
    }

    get valid() {
        if(!isDefined(this.item) || !isDefined(this.item.duration)) {
            return false;
        }

        return true;
    }

    toDocument() {
        let document = {
            '_id': this.id
        };

        if(isDefined(this.item)) {
            document['item'] = this.item.toDocument({
                keys: ['_id', 'type']
            });
        }

        if(isDefined(this.channelId)) {
            document['channelId'] = this.channelId;
        }

        if(isDefined(this.state)) {
            document['state'] = this.state;
        }

        if(isDefined(this.time)) {
            document['time'] = this.time;
        }

        if(isDefined(this.createdAt)) {
            document['createdAt'] = this.createdAt;
        }

        if(isDefined(this.updatedAt)) {
            document['updatedAt'] = this.updatedAt;
        }

        if(isDefined(this.endedAt)) {
            document['endedAt'] = this.endedAt;
        }

        if(isDefined(this.stalledAt)) {
            document['stalledAt'] = this.stalledAt;
        }

        if(isDefined(this.stalledPreviousState)) {
            document['stalledPreviousState'] = this.stalledPreviousState;
        }

        return document;
    }

    toPlainObject(options) {
        let document = {
            'id': this.id,
            'channelId': this.channelId,

            'state': this.state,
            'time': this.time,

            'createdAt': this.createdAt,
            'updatedAt': this.updatedAt,
            'endedAt': this.endedAt,

            'stalledAt': this.stalledAt,
            'stalledPreviousState': this.stalledPreviousState,

            'item': null
        };

        if(isDefined(this.item)) {
            document['item'] = this.item.toPlainObject();
        }

        return document;
    }

    static create(item, options) {
        return new Session(uuid.v4(), item, options);
    }

    static fromDocument(document) {
        if(!isDefined(document)) {
            return null;
        }

        return new Session(document['_id'], Item.fromDocument(document['item']), {
            'channelId': document['channelId'],

            'state': document['state'],
            'time': document['time'],

            'createdAt': document['createdAt'],
            'updatedAt': document['updatedAt'],
            'endedAt': document['endedAt'],

            'stalledAt': document['stalledAt'],
            'stalledPreviousState': document['stalledPreviousState']
        });
    }

    static fromPlainObject(item) {
        if(!isDefined(item)) {
            return null;
        }

        return new Session(item['id'], Item.fromPlainObject(item['item']), {
            'channelId': item['channelId'],

            'state': item['state'],
            'time': item['time'],

            'createdAt': item['createdAt'],
            'updatedAt': item['updatedAt'],
            'endedAt': item['endedAt'],

            'stalledAt': item['stalledAt'],
            'stalledPreviousState': item['stalledPreviousState']
        });
    }
}
