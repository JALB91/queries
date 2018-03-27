const fs = require('fs');
const Flickr = require('flickr-sdk');
const json2csv = require('json2csv').parse;
const PQueue = require('p-queue');

const flickr = new Flickr('14bdd7814d1209def7a960b39bd664d1');
const queue = new PQueue({ concurrency: 50 });

const MAX_RESULT = 4000;

//2.167964, 41.375023, 2.171805, 41.377326
//0.117273, 40.511265, 3.358239, 42.897671
const startLat = 0.117273;
const startLon = 40.511265;
const endLat = 3.358239;
const endLon = 42.897671;

const year = 2015;

const fields = ['owner', 'id', 'ownername', 'title', 'description', 'dateupload', 'datetaken', 'tags', 'latitude', 'longitude', 'url_o'];
const opts = { 'fields': fields, 'header': false };

function getDefaultRequestParams(year, bbox) {
    return {
        'min_upload_date': year + "-01-01",
        'max_upload_date': year + "-12-31",
        'bbox': bbox,
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
    let currentSLat = 0;
    let currentSLon = 0;
    let currentELat = 0;
    let currentELon = 0;

    let result = {};

    let segmentNum = 1.0;
    let segmentLat = 0;
    let segmentLon = 0;

    let found = false;

    do {
        currentSLat = startLat;
        currentSLon = startLon;
        currentELat = endLat;
        currentELon = endLon;

        const distanceLat = (currentELat - currentSLat) / segmentNum;
        const distanceLon = (currentELon - currentSLon) / segmentNum;

        currentSLat += distanceLat * segmentLat;
        currentSLon += distanceLon * segmentLon;
        currentELat = currentSLat + distanceLat;
        currentELon = currentSLon + distanceLon;

        const bbox = `${currentSLat}, ${currentSLon}, ${currentELat}, ${currentELon}`;
        let params = getDefaultRequestParams(year, bbox);
        const result = await getQueryResult(params);

        if (result) {
            console.log(`Checking result for lat ${segmentLat} and lon ${segmentLon}`);
            console.log(`BBOX is: ${bbox}`);
            console.log(`Total is: ${result['photos']['total']}`);
            if (parseInt(result['photos']['total']) > MAX_RESULT) {
                console.log('Increasing segment num');
                segmentNum *= 2.0;
                segmentLat = 0;
                segmentLon = 0;
            } else if (Math.abs((currentSLat + distanceLat) - endLat) < 0.05 && Math.abs((currentSLon + distanceLon) - endLon) < 0.05) {
                console.log('Got it');
                found = true;
            } else if (Math.abs((currentSLat + distanceLat) - endLat) < 0.05) {
                console.log('Going to next lon');
                segmentLon += 1;
                segmentLat = 0;
            } else {
                console.log('Going to next lat');
                segmentLat += 1;
            }
        } else {
            console.log('INVALID RESULT: ABORTING');
            return;
        }
        console.log(`***********************
***********************
***********************
***********************
***********************`);
    } while (!found);

    console.log(`Segmented ${segmentLat * segmentLon} times`);

    for (let segLat = 0; segLat <= segmentLat; segLat++) {
        for (let segLon = 0; segLon <= segmentLon; segLon++) {
            currentSLat = startLat;
            currentSLon = startLon;
            currentELat = endLat;
            currentELon = endLon;

            const distanceLat = (currentELat - currentSLat) / segmentNum;
            const distanceLon = (currentELon - currentSLon) / segmentNum;

            currentSLat += distanceLat * segLat;
            currentSLon += distanceLon * segLon;
            currentELat = currentSLat + distanceLat;
            currentELon = currentSLon + distanceLon;

            const bbox = `${currentSLat}, ${currentSLon}, ${currentELat}, ${currentELon}`;

            let params = getDefaultRequestParams(year, bbox);
            const result = await getQueryResult(params);
            const pages = result['photos']['pages'];

            params = addExtras(params);

            console.log(`Starting queries for ${pages} pages`);

            for (let i = 1; i <= pages; i++) {
                queue.add(() => {
                    console.log(`Querying page ${i}`);
                    params.page = i;
                    return Promise.resolve(
                        flickr.photos.search(params)
                        .catch(reason => {
                            console.log(reason);
                        })
                    )
                    .then(res => {
                        console.log("Fetching page: " + res.body['photos']['page']);
                        res.body['photos']['photo'].forEach(element => {
                            try {
                                element['description'] = element['description']['_content'];
                                fs.appendFile("./outputs/queries_" + year + ".csv", json2csv(element, opts) + '\n', function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                            } catch (err) {
                                console.error(err);
                            }
                        });
                    })
                    .catch(reason => {
                        console.log(reason);
                    });
                });
            }
            queue.onIdle()
            .then((result) => { console.log('Ended queries for year: ' + year) })
            .catch((reason) => console.log('Failed because: ' + reason));
        }
    }
}

function startQuery() {
    let csv = '';
    fields.forEach(field => {
        csv += '"' + field + '",';
    });

    csv = csv.substr(0, csv.length - 1) + '\n';

    fs.writeFile("./outputs/queries_" + year + ".csv", csv, function (err) {
        if (err) {
            return console.log(err);
        }
    });

    main();
}

startQuery();