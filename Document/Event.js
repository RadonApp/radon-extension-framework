export function on(element, eventName, selector, fn) {
    element.addEventListener(eventName, function(event) {
        let possibleTargets = element.querySelectorAll(selector);
        let target = event.target;

        for(let i = 0, l = possibleTargets.length; i < l; i++) {
            let el = target;
            let p = possibleTargets[i];

            while(el && el !== element) {
                if(el === p) {
                    fn.call(null, p, event);
                    return;
                }

                el = el.parentNode;
            }
        }
    });
}

export default {
    on
};
