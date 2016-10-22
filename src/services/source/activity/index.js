import Service from '../../base';
import _ActivityEngine from './engine';


export {_ActivityEngine as ActivityEngine};

export default class ActivityService extends Service {
    constructor(plugin) {
        super(plugin, 'activity', 'source/activity');
    }

    initialize() {
        super.initialize();
    }
}
