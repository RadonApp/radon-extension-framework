import IsNil from 'lodash-es/isNil';
import IsString from 'lodash-es/isString';


export default class Model {
    constructor(plugin, type, name) {
        if(IsNil(plugin)) {
            throw new Error('Invalid value provided for the "plugin" parameter');
        }

        if(!IsString(type)) {
            throw new Error('Invalid value provided for the "type" parameter (expected a string)');
        }

        if(!IsNil(name) && !IsString(name)) {
            throw new Error('Invalid value provided for the "name" parameter (expected a string)');
        }

        this.plugin = plugin;
        this.type = type;
        this.name = name;
    }
}
