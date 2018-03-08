const fs = require('fs');
const Flickr = require('flickr-sdk');
const json2csv = require('json2csv').parse;
const PQueue = require('p-queue');

const flickr = new Flickr('14bdd7814d1209def7a960b39bd664d1');
const queue = new PQueue({ concurrency: 10 });

const fields = ['owner', 'id', 'ownername', 'title', 'description', 'dateupload', 'datetaken', 'tags', 'latitude', 'longitude', 'url_o'];
const opts = { 'fields': fields, 'header': false };
let photos = [];

const currentYear = 2007;

function queryPageOfYear (year, page) {
    console.log("Querying page: " + page);
    return Promise.resolve(
        flickr.photos.search({
        extras: "description, date_upload, date_taken, owner_name, geo, tags, url_o",
        min_upload_date: year + "-01-01",
        max_upload_date: year + "-31-12",
        woe_id: 12578034,
        page: page
        })
    ).then(function (res) {
        console.log("Fetching page: " + res.body['photos']['page']);
        res.body['photos']['photo'].forEach(element => {
            try {
                element['description'] = element['description']['_content'];
                photos.push(element);
            } catch (err) {
                console.error(err);
                console.log("ERROR THIRD");
            }
        });
    }).catch(function (err) {
        console.error(err);
        console.log("ERROR SECOND");
    });
}

function queryYear(year) {
    console.log('Starting queries for year: ' + year);
    flickr.photos.search({
        min_upload_date: year + "-01-01",
        max_upload_date: year + "-31-12",
        woe_id: 12578034
    }).then(function (res) {
        const pages = res.body['photos']['pages'];
        console.log('Starting query for ' + pages + ' pages');
        console.log(res.body['photos']['total'] + ' total');
        for (let i = 1; i <= pages; i++) {
            queue.add(() => queryPageOfYear(year, i));
        }
        queue.onIdle()
        .then((result) => { console.log('Ended queries for year: ' + year); writeResults(); })
        .catch((reason) => console.log('Failed because: ' + reason));
    }, function(reason) {
        console.error(err);
        console.log("ERROR FIRST");
    });
}

function writeResults() {
    console.log('Writing file');
    let csv = "";

    fields.forEach(field => {
        csv += '"' + field + '",';
    });

    csv = csv.substr(0, csv.length - 1) + '\n';

    photos.forEach(photo => {
        csv += json2csv(photo, opts) + '\n';
    })

    fs.writeFile("./queries_" + currentYear + ".csv", csv, function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

queryYear(currentYear);