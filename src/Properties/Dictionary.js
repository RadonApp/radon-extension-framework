import Every from 'lodash-es/every';
import IsEqual from 'lodash-es/isEqual';
import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';

import ValueProperty from './Value';


export default class Dictionary extends ValueProperty {
    update(current, value) {
        if(IsNil(current)) {
            return value;
        }

        return Merge(current, value);
    }

    isEqual(a, b) {
        return IsEqual(a, b);
    }

    shouldCopyEncodedValue(items) {
        return (
            !IsNil(items) &&
            Object.keys(items).length > 0
        );
    }
}

export class Index extends Dictionary {
    shouldCopyEncodedValue(items) {
        return (
            !IsNil(items) &&
            Object.keys(items).length > 0 &&
            Every(items, (value) => Object.keys(value).length > 0)
        );
    }
}
