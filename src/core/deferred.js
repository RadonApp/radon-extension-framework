export default function Deferred() {
    let resolve_, reject_;

    let deferred = new Promise((resolve, reject) => {
        resolve_ = resolve;
        reject_ = reject;
    });

    deferred.resolve = function(value) {
        resolve_(value);
        return deferred;
    };

    deferred.reject = function(value) {
        reject_(value);
        return deferred;
    };

    deferred.promise = function() {
        return deferred.then();
    };

    return deferred;
}
