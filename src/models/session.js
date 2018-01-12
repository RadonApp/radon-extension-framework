/* eslint-disable no-multi-spaces, key-spacing */
import IsNil from 'lodash-es/isNil';
import Uuid from 'uuid';

import ItemDecoder from 'neon-extension-framework/models/item/core/decoder';
import {round} from 'neon-extension-framework/core/helpers';


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

        this.clientId = options.clientId || null;

        this.state = options.state || SessionState.created;
        this.time = options.time || null;

        this.createdAt = options.createdAt || null;
        this.updatedAt = options.updatedAt || null;
        this.endedAt = options.endedAt || null;

        this.stalledAt = options.stalledAt || null;
        this.stalledPreviousState = options.stalledPreviousState || null;
    }

    get progress() {
        if(IsNil(this.time)) {
            return null;
        }

        if(IsNil(this.item) || IsNil(this.item.duration)) {
            return null;
        }

        // Calculate session progress
        return round((this.time / this.item.duration) * 100, 2);
    }

    get valid() {
        if(IsNil(this.item) || IsNil(this.item.duration)) {
            return false;
        }

        return true;
    }

    toDocument() {
        let document = {
            '_id': this.id
        };

        if(!IsNil(this.item)) {
            document['item'] = this.item.toReference({
                include: ['_id', 'type']
            });
        }

        if(!IsNil(this.clientId)) {
            document['clientId'] = this.clientId;
        }

        if(!IsNil(this.state)) {
            document['state'] = this.state;
        }

        if(!IsNil(this.time)) {
            document['time'] = this.time;
        }

        if(!IsNil(this.createdAt)) {
            document['createdAt'] = this.createdAt;
        }

        if(!IsNil(this.updatedAt)) {
            document['updatedAt'] = this.updatedAt;
        }

        if(!IsNil(this.endedAt)) {
            document['endedAt'] = this.endedAt;
        }

        if(!IsNil(this.stalledAt)) {
            document['stalledAt'] = this.stalledAt;
        }

        if(!IsNil(this.stalledPreviousState)) {
            document['stalledPreviousState'] = this.stalledPreviousState;
        }

        return document;
    }

    toPlainObject(options) {
        let document = {
            'id': this.id,
            'clientId': this.clientId,

            'state': this.state,
            'time': this.time,

            'createdAt': this.createdAt,
            'updatedAt': this.updatedAt,
            'endedAt': this.endedAt,

            'stalledAt': this.stalledAt,
            'stalledPreviousState': this.stalledPreviousState,

            'item': null
        };

        if(!IsNil(this.item)) {
            document['item'] = this.item.toPlainObject();
        }

        return document;
    }

    static create(item, options) {
        return new Session(Uuid.v4(), item, options);
    }

    static fromDocument(document) {
        if(IsNil(document)) {
            return null;
        }

        return new Session(document['_id'], ItemDecoder.fromDocument(document['item']), {
            'clientId': document['clientId'],

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
        if(IsNil(item)) {
            return null;
        }

        return new Session(item['id'], ItemDecoder.fromPlainObject(item['item']), {
            'clientId': item['clientId'],

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
