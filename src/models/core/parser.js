import {isDefined} from 'eon.extension.framework/core/helpers';
import {ModelTypes} from 'eon.extension.framework/models/all';

import clone from 'lodash-es/clone';


export default class Parser {
    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Retrieve model type
        let type = data['#type'];

        if(!isDefined(type)) {
            console.warn('Missing "#type" property on object', data);
            return null;
        }

        // Clone `data` object
        data = clone(data);

        // Parse child models
        Parser._parseChildren(data);

        // Try find model matching `type`
        let model = ModelTypes[type];

        if(!isDefined(model)) {
            console.warn('Unknown model type: %o', type, data);
            return null;
        }

        // Ensure `parse` method exists
        if(!isDefined(model.parse)) {
            console.warn('Model %o has no "parse" method defined', model);
            return null;
        }

        // Parse `data` with matching `model`
        return model.parse(data);
    }

    static _parseChildren(data) {
        Object.keys(data).forEach((key) => {
            if(key.indexOf('~') === 0) {
                let value = data[key];

                // Remove entry
                delete data[key];

                // Parse child, and store in `data`
                data[key.substring(1)] = Parser.parse(value);
            }
        });
    }
}
