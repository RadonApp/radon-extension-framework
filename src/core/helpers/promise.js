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
