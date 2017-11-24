import Item from '../core/base';


export default class Artist extends Item {
    static type = 'music/artist';

    constructor(values, children) {
        super(values, children);
    }
}
