import Chunk from 'lodash-es/chunk';

import {runSequential} from './Promise';


export function createTask(target) {
    return new Promise((resolve, reject) => {
        setTimeout(() => target().then(resolve, reject), 0);
    });
}

export function createTasks(values, size, target) {
    if(values.length < 1) {
        return Promise.resolve();
    }

    return runSequential(Chunk(values, size), (chunk) =>
        createTask(() => target(chunk))
    );
}
