let getType = {};

export function isUndefined(value) {
    return typeof value === 'undefined';
}

export function isDefined(value) {
    return !isUndefined(value) && value !== null;
}

export function isFunction(functionToCheck) {
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

export function isString(value) {
    return isDefined(value) && typeof value === 'string';
}

export function setDefault(value, defaultValue) {
    if(!isDefined(value)) {
        if(!isDefined(defaultValue)) {
            return null;
        }

        return defaultValue;
    }

    return value;
}
