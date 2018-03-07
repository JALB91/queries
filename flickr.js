const fs = require('fs');
const Flickr = require('flickr-sdk');
const json2csv = require('json2csv').parse;
let PromisePool = require('es6-promise-pool');


const startQueries = function * (pages) {
    for (let i = 1; i <= pages; i++) {
        console.log("Querying page: " + i);
        flickr.photos.search({
            min_upload_date: "01/01/2004 00:00:00",
            max_upload_date: "31/12/2017 00:00:00",
            bbox: "0.078821, 40.448591,  3.366479, 42.897671",
            extras: "description, date_upload, date_taken, owner_name, geo, tags, url_o",
            page: i
        }).then(function (res) {
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
}


const fields = ['owner', 'id', 'ownername', 'title', 'description', 'dateupload', 'datetaken', 'tags', 'latitude', 'longitude', 'url_o'];
const opts = { fields };
let photos = [];

let flickr = new Flickr('14bdd7814d1209def7a960b39bd664d1');

flickr.photos.search({
    min_upload_date: "01/01/2004 00:00:00",
    max_upload_date: "31/12/2017 00:00:00",
    bbox: "0.078821, 40.448591,  3.366479, 42.897671"
}).then(function (res) {
    const pages = res.body['photos']['pages'];
    let iterator = startQueries(pages);
    let pool = new PromisePool(iterator, pages);
    pool.start().then(function() {
        fetchResults();
    });

}).catch(function (err) {
    console.error(err);
    console.log("ERROR FIRST");
});

function fetchResults() {
    const csv = json2csv(photos, opts);
    fs.writeFile("./test.csv", csv, function(err) {
        if (err) {
            return console.log(err);
        }
    });
}