import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Metadata} from 'eon.extension.framework/models/metadata';


export default class Show extends Metadata {
    constructor(source, id, title, year) {
        super(source, id, title, ContentTypes.Video, MediaTypes.Video.Show);

        this.year = year || null;
    }

    dump() {
        let result = super.dump();

        result.year = this.year;

        return result;
    }
}
