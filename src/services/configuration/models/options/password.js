import InputOption from './input';


export default class PasswordOption extends InputOption {
    constructor(plugin, name, options) {
        super(plugin, 'password', name, options);
    }
}
