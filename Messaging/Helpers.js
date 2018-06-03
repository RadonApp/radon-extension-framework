export function parseMessageName(name) {
    let parts = name.split('/', 3);

    if(parts.length === 3) {
        return {
            channel: parts[0],
            service: parts[1],
            name: parts[2]
        };
    }

    if(parts.length === 2) {
        return {
            channel: parts[0],
            name: parts[1]
        };
    }

    return null;
}
