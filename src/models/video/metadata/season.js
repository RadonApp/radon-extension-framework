import {ContentTypes, MediaTypes} from 'eon.extension.framework/core/enums';
import {Metadata} from 'eon.extension.framework/models/metadata';


export default class Season extends Metadata {
    constructor(source, id, title, year, number, show) {
        super(source, id, title, ContentTypes.Video, MediaTypes.Video.Season);

        this.year = year;
        this.number = number;

        this.show = show;
    }

    dump() {
        let result = super.dump();

        result.year = this.year;
        result.number = this.number;

        result.show = this.show ? this.show.dump() : null;

        return result;
    }
}
