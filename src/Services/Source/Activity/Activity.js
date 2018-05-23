import Service from '../../Core/Base';


export default class ActivityService extends Service {
    constructor(plugin) {
        super(plugin, 'activity', 'source/activity');
    }
}
