export function retry(target, options) {
    options = {
        attempts: 10,
        delay: 500,

        ...(options || {})
    };

    return new Promise((resolve, reject) => {
        let attempt = 0;
        let lastError;

        function next() {
            attempt++;

            // Try retrieve result
            Promise.resolve().then(() =>
                target()
            ).then((result) => {
                resolve(result);
            }, (err) => {
                lastError = err;

                // Maximum attempts reached
                if(attempt > options.attempts) {
                    reject(lastError);
                    return;
                }

                // Schedule next attempt
                setTimeout(next, options.delay);
            });
        }

        next();
    });
}

export function resolveOne(items, target) {
    return new Promise((resolve, reject) => {
        let position = 0;

        function next() {
            if(position >= items.length) {
                resolve(null);
                return;
            }

            // Run next promise
            target(items[position++]).then((result) => {
                resolve(result);
            }, () => {
                next();
            });
        }

        next();
    });
}

export function runSequential(items, target) {
    return new Promise((resolve, reject) => {
        let position = 0;
        let results = [];

        function next() {
            if(position >= items.length) {
                resolve(results);
                return;
            }

            // Run next promise
            target(items[position++]).then((result) => {
                results.push(result);
                next();
            }, (err) => {
                reject(err);
            });
        }

        next();
    });
}
