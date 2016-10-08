export function getProperty(options, key, defaultValue) {
    if(typeof options[key] === 'undefined') {
        return defaultValue;
    }

    return options[key];
}
