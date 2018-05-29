import IsNil from 'lodash-es/isNil';


export function hasClass(node, className) {
    if(IsNil(node.classList)) {
        return false;
    }

    return node.classList.contains(className);
}

export function hasClassTree(node) {
    let args = Array.from(arguments).slice(1);
    let current = node;

    for(let i = 0; i < args.length; ++i) {
        // Ensure parent exists
        if(IsNil(current)) {
            return false;
        }

        // Check if `current` matches class
        let className = args[i];

        if(IsNil(className)) {
            // Switch to parent node
            current = current.parentNode;
            continue;
        }

        if(IsNil(current.classList) || !current.classList.contains(className)) {
            return false;
        }

        // Switch to parent node
        current = current.parentNode;
    }

    return true;
}
