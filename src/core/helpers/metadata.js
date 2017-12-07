import IsNil from 'lodash-es/isNil';


export function cleanTitle(value) {
    if(IsNil(value)) {
        return value;
    }

    return value
        .replace(/[^\w\s]/gi, '')  // Remove special characters
        .replace(/\s+/g, ' ')      // Remove extra spaces
        .toLowerCase();
}

export function encodeTitle(value) {
    if(IsNil(value)) {
        return value;
    }

    return encodeURIComponent(value).replace(/%20/g, '+');
}
