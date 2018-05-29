import IsNil from 'lodash-es/isNil';


export function toCssUrl(url) {
    if(IsNil(url)) {
        return null;
    }

    return 'url(' + url + ')';
}
