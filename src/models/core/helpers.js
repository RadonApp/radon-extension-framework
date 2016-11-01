import {isDefined} from 'eon.extension.framework/core/helpers';


export function dumpModel(model) {
    if(!isDefined(model)) {
        return null;
    }

    return model.dump();
}
