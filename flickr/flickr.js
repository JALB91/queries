import Flickr from 'flickr-sdk';
const PQueue = require('p-queue');
import * as data from './data';

const flickr = new Flickr('14bdd7814d1209def7a960b39bd664d1');
const queues = {};

export const getQueryResult = (params) => {
    return flickr.photos.search(params);
};

export const addToQueue = (year, month, params) => {
    if (!queues.hasOwnProperty(month)) {
        queues[month] = new PQueue({ concurrency: 50 });
        queues[month].pause();
    }
    queues[month].add(() => {
        return Promise.resolve(flickr.photos.search(params))
        .then(result => data.append_result(year, month, result['body']))
        .catch(reason => console.warn(reason))
    });
};

export const startQueries = (year, month, callback) => {
    if (!queues.hasOwnProperty(month)) {
        console.warn(`${month} Not found`);
    }
    data.init_file(year, month);
    queues[month].start();
    queues[month].onIdle()
    .then(result => callback(result))
    .catch(reason => console.warn(reason));
}