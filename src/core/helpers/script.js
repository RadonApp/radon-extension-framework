export function createScript(document, url) {
    // Create script element
    let script = document.createElement('script');

    script.src = url;

    // Remove element on load
    script.onload = function() {
        this.remove();
    };

    return script;
}
