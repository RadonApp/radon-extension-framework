import IsNil from 'lodash-es/isNil';


export function isString(value) {
    return !IsNil(value) && typeof value === 'string';
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
