export function createCookie({name, value, days, domain, secure}) {
    // Format cookie expiry
    let expires = '';

    if(days) {
        let expiresAt = new Date();

        expiresAt.setTime(Date.now() + 24 * days * 60 * 60 * 1e3);
        expires = `; expires=${expiresAt.toUTCString()}`;
    } else {
        expires = '';
    }

    // Format cookie
    let cookie = `${name}=${value}${expires}; path=/`;

    if(secure) {
        cookie += ';secure';
    }

    if(domain && domain.length) {
        cookie += `;domain=${domain}`;
    }

    // Create cookie
    document.cookie = cookie;
}

export function deleteCookie(name, domain = null) {
    createCookie({
        name,
        domain,

        value: '',
        days: -1
    });
}

export function getCookies() {
    return document.cookie.split(';').map((cookie) =>
        cookie.trim().split('=')
    ).reduce(function(cookies, cookie) {
        cookies[cookie[0]] = cookie[1];
        return cookies;
    }, {});
}

export function getCookie(name) {
    return getCookies()[name];
}

export default {
    all: getCookies,
    create: createCookie,
    delete: deleteCookie,
    get: getCookie
};
