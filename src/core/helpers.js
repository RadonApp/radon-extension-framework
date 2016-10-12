let getType = {};

export function isDefined(value) {
    return typeof value !== 'undefined' && value !== null;
}

export function isFunction(functionToCheck) {
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

export function toCssUrl(url) {
    if(!isDefined(url)) {
        return null;
    }

    return 'url(' + url + ')';
}
