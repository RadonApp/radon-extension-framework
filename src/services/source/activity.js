import Service from '../base';


export default class ActivityService extends Service {
    constructor(plugin) {
        super(plugin, 'activity', 'source/activity');
    }

    initialize() {
        super.initialize();
    }
}
