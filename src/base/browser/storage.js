export default class BrowserStorage {
    get(key) {
        return localStorage.getItem(key);
    }

    set(key, value) {
        return localStorage.setItem(key, value);
    }

    remove(key) {
        return localStorage.removeItem(key);
    }
}