import Flatten from 'lodash-es/flatten';
import IsNil from 'lodash-es/isNil';
import Map from 'lodash-es/map';
import Reduce from 'lodash-es/reduce';


export function isString(value) {
    return !IsNil(value) && typeof value === 'string';
}

export function product(...arrays) {
    return Reduce(arrays, (a, b) => Flatten(
        Map(a, (x) =>
            Map(b, (y) => x.concat([y]))
        )
    ), [[]]);
}

export function setDefault(value, defaultValue) {
    if(IsNil(value)) {
        if(IsNil(defaultValue)) {
            return null;
        }

        return defaultValue;
    }

    return value;
}
