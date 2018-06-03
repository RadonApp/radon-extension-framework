/* eslint-disable no-multi-spaces, key-spacing */
import IsNil from 'lodash-es/isNil';

import {MediaTypes} from '../../../Core/Enums';
import {Artist, Album, Track} from '../Music';
import {Movie, Show, Season, Episode} from '../Video';


export default class ItemDecoder {
    static Items = {
        // Music
        [MediaTypes.Music.Artist]:  Artist,
        [MediaTypes.Music.Album]:   Album,
        [MediaTypes.Music.Track]:   Track,

        // Video
        [MediaTypes.Video.Movie]:   Movie,
        [MediaTypes.Video.Show]:    Show,
        [MediaTypes.Video.Season]:  Season,
        [MediaTypes.Video.Episode]: Episode
    };

    static fromDocument(...args) {
        let { type, value } = ItemDecoder._parseArguments(args);

        if(IsNil(value)) {
            throw new Error('Invalid document');
        }

        if(IsNil(type)) {
            throw new Error('No type available');
        }

        // Retrieve model
        let model = this.get(type);

        if(IsNil(model)) {
            throw new Error('Unknown type: ' + type);
        }

        // Decode document
        return model.fromDocument(value, {
            decoder: this
        });
    }

    static fromPlainObject(...args) {
        let { type, value } = ItemDecoder._parseArguments(args);

        if(IsNil(value)) {
            throw new Error('Invalid plain object');
        }

        if(IsNil(type)) {
            throw new Error('No type available');
        }

        // Retrieve model
        let model = this.get(type);

        if(IsNil(model)) {
            throw new Error('Unknown type: ' + type);
        }

        // Decode plain object
        return model.fromPlainObject(value, {
            decoder: this
        });
    }

    static get(type) {
        return this.Items[type] || null;
    }

    static _parseArguments(args) {
        let type, value;

        if(args.length === 1) {
            value = args[0];
        }

        if(args.length === 2) {
            type = args[0];
            value = args[1];
        }

        return {
            type: type || value.type,
            value
        };
    }
}
