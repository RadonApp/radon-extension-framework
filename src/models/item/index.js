import Artist from 'neon-extension-framework/models/item/music/artist';
import Album from 'neon-extension-framework/models/item/music/album';
import Track from 'neon-extension-framework/models/item/music/track';
import Movie from 'neon-extension-framework/models/item/movie';
import {isDefined} from 'neon-extension-framework/core/helpers';


export const ItemsByType = {
    'music/artist': Artist,
    'music/album': Album,
    'music/track': Track,

    'movie': Movie
};

export class ItemBuilder {
    createArtist(values) {
        return new Artist(values, { builder: this });
    }

    createAlbum(values) {
        return new Album(values, { builder: this });
    }

    createTrack(values) {
        return new Track(values, { builder: this });
    }

    decode(item) {
        if(!isDefined(item)) {
            return null;
        }

        if(!isDefined(ItemsByType[item.type])) {
            throw new Error('Unknown item type: "' + item.type + '"');
        }

        return ItemsByType[item.type].decode(item, {
            builder: this
        });
    }
}

export default new ItemBuilder();
