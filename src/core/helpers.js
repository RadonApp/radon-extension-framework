let getType = {};

export function generateRandomString(length, chars) {
    let result = '';

    for(let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

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
