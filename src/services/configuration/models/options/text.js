import InputOption from './input';


export default class TextOption extends InputOption {
    constructor(plugin, name, options) {
        super(plugin, 'text', name, options);
    }
}
