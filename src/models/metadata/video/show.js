import {Metadata} from '../core/base';


export default class Show extends Metadata {
    constructor(source, id, title, year) {
        super(source, id, title);

        this.year = year || null;
    }

    dump() {
        var result = super.dump();
        result.type = 'show';

        result.year = this.year;

        return result;
    }
}
