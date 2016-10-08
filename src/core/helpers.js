export function isDefined(value) {
    return typeof value !== 'undefined' && value !== null;
}

export function toCssUrl(url) {
    if(!isDefined(url)) {
        return null;
    }

    return 'url(' + url + ')';
}
