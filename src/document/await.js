import IsNil from 'lodash-es/isNil';


export function awaitBody() {
    return new Promise((resolve, reject) => {
        if(!IsNil(document.body)) {
            // Resolve promise
            resolve(document.body);
            return;
        }

        function listener() {
            // Unbind from the "DOMContentLoaded" event
            document.removeEventListener('DOMContentLoaded', listener);

            // Reject promise if body is not defined
            if(IsNil(document.body)) {
                reject(new Error('Body wasn\'t found after the "DOMContentLoaded" event'));
                return;
            }

            // Resolve promise
            resolve(document.body);
        }

        // Bind to the "DOMContentLoaded" event
        document.addEventListener('DOMContentLoaded', listener);
    });
}

export function awaitElement(container, selector) {
    return new Promise((resolve) => {
        function check() {
            let element = container.querySelector(selector);

            if(IsNil(element)) {
                return false;
            }

            // Resolve promise
            resolve(element);
            return true;
        }

        // Check if the element exists
        if(check()) {
            return;
        }

        // Create observer
        let observer = new MutationObserver(() => {
            if(check()) {
                observer.disconnect();
            }
        });

        // Observe container for subtree changes
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    });
}


export function awaitElements(container, ...path) {
    return new Promise((resolve, reject) => {
        let current = container;
        let pending = path.slice(0);

        function next() {
            awaitElement(current, pending.shift()).then((element) => {
                if(pending.length < 1) {
                    resolve(element);
                    return;
                }

                next();
            }, (err) => {
                reject(err);
            });
        }

        next();
    });
}
