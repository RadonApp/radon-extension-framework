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

export function hasClass(node, className) {
    if(!isDefined(node.classList)) {
        return false;
    }

    return node.classList.contains(className);
}

export function hasClassTree(node) {
    let args = Array.from(arguments).slice(1);
    let current = node;

    for(let i = 0; i < args.length; ++i) {
        // Ensure parent exists
        if(!isDefined(current)) {
            return false;
        }

        // Check if `current` matches class
        let className = args[i];

        if(!isDefined(className)) {
            // Switch to parent node
            current = current.parentNode;
            continue;
        }

        if(!isDefined(current.classList) || !current.classList.contains(className)) {
            return false;
        }

        // Switch to parent node
        current = current.parentNode;
    }

    return true;
}

export function round(value, digits) {
    return +(Math.round(value + 'e+' + digits) + 'e-' + digits);
}

export function toCssUrl(url) {
    if(!isDefined(url)) {
        return null;
    }

    return 'url(' + url + ')';
}
