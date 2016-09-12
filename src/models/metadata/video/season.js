import {Metadata} from '../core/base';


export default class Season extends Metadata {
    constructor(source, id, title, number, show) {
        super(source, id, title);

        this.number = number;

        this.show = show;
    }
}
