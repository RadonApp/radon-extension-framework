import InputOption from './input';


export default class TextOption extends InputOption {
    constructor(plugin, name, label, options) {
        super(plugin, 'text', name, label, options);
    }
}
