import {Metadata} from '../core/base';


export default class Artist extends Metadata {
    constructor(source, id, title) {
        super(source, id, title);
    }

    dump() {
        var result = super.dump();
        result.type = 'artist';

        return result;
    }
}
