import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Metadata} from 'eon.extension.framework/models/metadata';


export default class Artist extends Metadata {
    constructor(source, id, title) {
        super(source, id, title, ContentTypes.Music, MediaTypes.Music.Artist);
    }
}
