import {isDefined} from './value';


export function cleanTitle(value) {
    if(!isDefined(value)) {
        return value;
    }

    return value
        .replace(/[^\w\s]/gi, '')  // Remove special characters
        .replace(/\s+/g, ' ')      // Remove extra spaces
        .toLowerCase();
}

export function encodeTitle(value) {
    if(!isDefined(value)) {
        return value;
    }

    return encodeURIComponent(value).replace(/%20/g, '+');
}
