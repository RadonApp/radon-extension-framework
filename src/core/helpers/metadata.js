import IsNil from 'lodash-es/isNil';
import Slugify from 'slugify';


const SlugRemoveRegex = /[\>\<]/g;
const SlugSpaceRegex = /(\s[~+_,\-\\\/!;:@]+\s)|((^|\s)[~+_,\-\\\/!;:@]+)|([~+_,\-\\\/!;:@]+($|\s))|([;:]+)/g;

export function cleanTitle(value) {
    if(IsNil(value)) {
        return value;
    }

    return value
        .replace(/[^\w\s]/gi, '')  // Remove special characters
        .replace(/\s+/g, ' ')      // Remove extra spaces
        .toLowerCase();
}

export function createSlug(value) {
    if(IsNil(value)) {
        return null;
    }

    // Remove characters
    value = value.replace(SlugRemoveRegex, '');

    // Replace leading and trailing special characters
    value = value.replace(SlugSpaceRegex, ' ');

    // Create slug
    return Slugify(value, {
        lower: true,
        remove: /[\[\]()'"*.?]/g
    });
}

export function encodeTitle(value) {
    if(IsNil(value)) {
        return value;
    }

    return encodeURIComponent(value).replace(/%20/g, '+');
}
