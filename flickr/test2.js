const fs = require('fs');
const Flickr = require('flickr-sdk');
const json2csv = require('json2csv').parse;
const PQueue = require('p-queue');
import bbox from './bbox';

const flickr = new Flickr('14bdd7814d1209def7a960b39bd664d1');
const queue = new PQueue({ concurrency: 50 });

const MAX_RESULT = 4000;

//2.167964, 41.375023, 2.171805, 41.377326
//0.117273, 40.511265, 3.358239, 42.897671
const box = new bbox(0.117273, 40.511265, 3.358239, 42.897671);

const year = 2015;

const fields = ['owner', 'id', 'ownername', 'title', 'description', 'dateupload', 'datetaken', 'tags', 'latitude', 'longitude', 'url_o'];
const opts = { 'fields': fields, 'header': false };

function getDefaultRequestParams(year, box) {
    return {
        'min_upload_date': year + "-01-01",
        'max_upload_date': year + "-12-31",
        'bbox': box.getString(),
        'per_page': 500
    }
}

async function getQueryResult(params) {
    try {
        const result = await flickr.photos.search(params);
        return result.body;
    } catch (e) {
        console.log(e);
        return null;
    }
}

function addExtras(params) {
    params.extras = "description, date_upload, date_taken, owner_name, geo, tags, url_o";
    return params;
}

function setPageNum(params, num) {
    params.page = num;
    return params;
}

async function main() {
    let iter = 0;
    do {
        const ended = box.removeSectionIfNeeded() && iter > 0;
        iter++;
        const params = getDefaultRequestParams(year, box);
        const result = await getQueryResult(params);
        if (!ended && parseInt(result['photos']['total']) >= MAX_RESULT) {
            box.addSection();
        } else if (!ended) {
            box.goToNextSection();
            // const pages = result['photos']['pages'];
            // params = addExtras(params);

            // for (let i = 1; i <= pages; i++) {
            //     queue.add(() => {
            //         console.log(`Querying page ${i}`);
            //         params.page = i;
            //         return Promise.resolve(
            //             flickr.photos.search(params)
            //             .catch(reason => {
            //                 console.log(reason);
            //             })
            //         )
            //         .then(res => {
            //             console.log("Fetching page: " + res.body['photos']['page']);
            //             res.body['photos']['photo'].forEach(element => {
            //                 try {
            //                     element['description'] = element['description']['_content'];
            //                     fs.appendFile("./outputs/queries_" + year + ".csv", json2csv(element, opts) + '\n', function (err) {
            //                         if (err) {
            //                             return console.log(err);
            //                         }
            //                     });
            //                 } catch (err) {
            //                     console.error(err);
            //                 }
            //             });
            //         })
            //         .catch(reason => {
            //             console.log(reason);
            //         });
            //     });
            // }
            // queue.onIdle()
            // .then((result) => { console.log('Ended queries for year: ' + year) })
            // .catch((reason) => console.log('Failed because: ' + reason));
        }
    } while(!box.isEnded())
}

function startQuery() {
    let csv = '';
    fields.forEach(field => {
        csv += '"' + field + '",';
    });

    csv = csv.substr(0, csv.length - 1) + '\n';

    fs.writeFile("./queries_" + year + ".csv", csv, function (err) {
        if (err) {
            return console.log(err);
        }
    });

    main();
}

startQuery();