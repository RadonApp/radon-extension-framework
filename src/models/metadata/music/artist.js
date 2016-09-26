import {ContentTypes, MediaTypes} from '../../../core/enums';
import {Metadata} from '../core/base';


export default class Artist extends Metadata {
    constructor(source, id, title) {
        super(source, id, title, ContentTypes.Music, MediaTypes.Music.Artist);
    }
}
