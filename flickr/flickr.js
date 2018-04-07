import Flickr from 'flickr-sdk';
const PQueue = require('p-queue');
import * as data from './data';

const flickr = new Flickr('14bdd7814d1209def7a960b39bd664d1');
const queue = new PQueue({ concurrency: 50 });
queue.pause();

export const getQueryResult = (params) => {
    return flickr.photos.search(params);
};

export const queryAndSave = (params) => {
    return Promise.resolve(getQueryResult(params))
    .then(result => data.append_result(result['body']))
    .catch(reason => console.warn(reason));
}

export const addToQueue = (params) => {
    queue.add(() => {
        return Promise.resolve(flickr.photos.search(params))
        .then(result => data.append_result(result['body']))
        .catch(reason => console.warn(reason))
    });
};

export const startQueries = (callback) => {
    console.log('STARTING QUERIES');
    data.init_file();
    queue.start();
    queue.onIdle()
    .then(result => callback(result))
    .catch(reason => console.warn(reason));
}