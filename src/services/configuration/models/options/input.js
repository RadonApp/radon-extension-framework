import {Option} from './core/base';


export default class InputOption extends Option {
    get() {
        return this.preferences.getString(this.name);
    }
}
