import InputOption from './input';


export default class PasswordOption extends InputOption {
    constructor(plugin, name, label, options) {
        super(plugin, 'password', name, label, options);
    }
}
