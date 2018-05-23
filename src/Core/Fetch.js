import IsFunction from 'lodash-es/isFunction';
import IsNil from 'lodash-es/isNil';


function get(resolve) {
    try {
        return resolve();
    } catch(e) {
        return null;
    }
}

function getFunction(resolve) {
    let value = get(resolve);

    if(IsNil(value) || !IsFunction(value)) {
        return null;
    }

    return value;
}

const _Headers = (
    get(() => content.Headers) ||
    get(() => Headers)
);

const _Request = (
    get(() => content.Request) ||
    get(() => Request)
);

const _Response = (
    get(() => content.Response) ||
    get(() => Response)
);

const _fetch = (
    getFunction(() => content.fetch) ||
    getFunction(() => fetch)
);

export {
    _Headers as Headers,
    _Request as Request,
    _Response as Response,

    _fetch as fetch
};
