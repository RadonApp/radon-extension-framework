import {ContentTypes, MediaTypes} from '../../../core/enums';
import {Metadata} from '../core/base';


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
