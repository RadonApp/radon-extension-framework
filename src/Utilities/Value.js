import Flatten from 'lodash-es/flatten';
import IsNil from 'lodash-es/isNil';
import Map from 'lodash-es/map';
import Reduce from 'lodash-es/reduce';


export function capitalize(value) {
    if(value.length < 1) {
        return value;
    }

    return value[0].toUpperCase() + value.substring(1);
}

export function generateRandomString(length, chars) {
    let result = '';

    for(let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

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

export function round(value, digits) {
    return +(Math.round(value + 'e+' + digits) + 'e-' + digits);
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
