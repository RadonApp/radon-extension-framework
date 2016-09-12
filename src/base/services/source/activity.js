import {NotImplementedException} from '../../../core/exceptions';
import Service from '../base';


export default class ActivityService extends Service {
    constructor(plugin) {
        super(plugin, 'activity', 'source/activity');
    }

    initialize() {
        throw new NotImplementedException();
    }
}
