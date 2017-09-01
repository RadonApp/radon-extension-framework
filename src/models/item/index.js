import Artist from 'eon.extension.framework/models/item/music/artist';
import Album from 'eon.extension.framework/models/item/music/album';
import Track from 'eon.extension.framework/models/item/music/track';
import Movie from 'eon.extension.framework/models/item/movie';
import {isDefined} from 'eon.extension.framework/core/helpers';


export const ItemsByType = {
    'music/artist': Artist,
    'music/album': Album,
    'music/track': Track,

    'movie': Movie
};

export default class Item {
    static fromDocument(document) {
        if(!isDefined(document)) {
            return null;
        }

        if(!isDefined(ItemsByType[document.type])) {
            throw new Error('Unknown item type: "' + document.type + '"');
        }

        return ItemsByType[document.type].fromDocument(document);
    }

    static fromPlainObject(item) {
        if(!isDefined(item)) {
            return null;
        }

        if(!isDefined(ItemsByType[item.type])) {
            throw new Error('Unknown item type: "' + item.type + '"');
        }

        return ItemsByType[item.type].fromPlainObject(item);
    }
}
