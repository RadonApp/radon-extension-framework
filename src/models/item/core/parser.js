import IsNil from 'lodash-es/isNil';

import Movie from '../movie';
import {Artist, Album, Track} from '../music';


export const ItemsByType = {
    'music/artist': Artist,
    'music/album': Album,
    'music/track': Track,

    'movie': Movie
};

export class ItemParser {
    decode(type, item) {
        if(IsNil(type)) {
            throw new Error('Invalid value provided for the "type" parameter: ' + type);
        }

        if(IsNil(item)) {
            throw new Error('Invalid value provided for the "item" parameter:' + item);
        }

        if(IsNil(ItemsByType[type])) {
            throw new Error('Unknown item type: "' + type + '"');
        }

        return ItemsByType[type].decode(item, {
            parser: this
        });
    }

    decodeItem(item) {
        return this.decode(item.type, item);
    }
}

export default new ItemParser();
