import {Metadata} from '../core/base';


export default class Season extends Metadata {
    constructor(source, id, title, year, number, show) {
        super(source, id, title);

        this.year = year;
        this.number = number;

        this.show = show;
    }

    dump() {
        var result = super.dump();
        result.type = 'season';

        result.year = this.year;
        result.number = this.number;

        result.show = this.show ? this.show.dump() : null;

        return result;
    }
}
