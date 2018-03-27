const fs = require('fs');
const Flickr = require('flickr-sdk');
const json2csv = require('json2csv').parse;
const PQueue = require('p-queue');

const flickr = new Flickr('14bdd7814d1209def7a960b39bd664d1');
const queue = new PQueue({ concurrency: 50 });

const dayInMonth = {
    '01': '31',
    '02': '28',
    '03': '31',
    '04': '30',
    '05': '31',
    '06': '30',
    '07': '31',
    '08': '31',
    '09': '30',
    '10': '31',
    '11': '30',
    '12': '31'
};

const fields = ['owner', 'id', 'ownername', 'title', 'description', 'dateupload', 'datetaken', 'tags', 'latitude', 'longitude', 'url_o'];

const opts = { 'fields': fields, 'header': false };

const startYear = 2015;
const endYear = 2015;

const paramsOne = {
    bbox: '2.018053, 41.384835, 2.164376, 41.486100',
    // woe_id: 12578034,
    per_page: 100
};

const paramsTwo = {
    extras: 'description, date_upload, date_taken, owner_name, geo, tags, url_o',
    bbox: '2.018053, 41.384835, 2.164376, 41.486100',
    // woe_id: 12578034,
    per_page: 100
};

function queryPageOfMonthOfYear(year, month, page) {
    console.log('Querying page: ' + page);
    paramsTwo.page = page;
    // paramsTwo.min_upload_date = year + '-01-01';
    // paramsTwo.max_upload_date = year + '-12-31';
    paramsTwo.min_taken_date = `${year}-${month}-01`;
    paramsTwo.max_taken_date = `${year}-${month}-${dayInMonth[month]}`;
    return Promise.resolve(
        flickr.photos.search(paramsTwo))
        .then(function (res) {
            console.log('Fetching page: ' + res.body['photos']['page']);
            res.body['photos']['photo'].forEach(element => {
                try {
                    element['description'] = element['description']['_content'];
                    fs.appendFile('./outputs/2/queries_' + year + '.csv', json2csv(element, opts) + '\n', function(err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                } catch (err) {
                    console.error(err);
                }
            });
        }).catch(function (err) {
            console.error(err);
        }
    );
}

function queryPageOfYear (year, page) {
    console.log('Querying page: ' + page);
    paramsTwo.page = page;
    // paramsTwo.min_upload_date = year + '-01-01';
    // paramsTwo.max_upload_date = year + '-12-31';
    paramsTwo.min_taken_date = year + '-02-01';
    paramsTwo.max_taken_date = year + '-02-31';
    return Promise.resolve(
        flickr.photos.search(paramsTwo))
        .then(function (res) {
            console.log('Fetching page: ' + res.body['photos']['page']);
            res.body['photos']['photo'].forEach(element => {
                try {
                    element['description'] = element['description']['_content'];
                    fs.appendFile('./outputs/2/queries_' + year + '.csv', json2csv(element, opts) + '\n', function(err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                } catch (err) {
                    console.error(err);
                }
            });
        }).catch(function (err) {
            console.error(err);
        }
    );
}

function queryYear(year) {
    console.log('Starting queries for year: ' + year);
    // paramsOne.min_upload_date = year + '-01-01';
    // paramsOne.max_upload_date = year + '-12-31';
    // paramsOne.min_taken_date = year + '-02-01';
    // paramsOne.max_taken_date = year + '-02-28';

    Object.keys(dayInMonth).forEach(month => {
        if (dayInMonth.hasOwnProperty(month)) {
            console.log('Starting queries for month: ' + month);
            paramsOne.min_taken_date = `${year}-${month}-01`;
            paramsOne.max_taken_date = `${year}-${month}-${dayInMonth[month]}`;

            flickr.photos.search(paramsOne)
            .then(function (res) {
                const pages = res.body['photos']['pages'];
                console.log('Starting query for ' + pages + ' pages');
                console.log(res.body['photos']['total'] + ' total');
                for (let i = 1; i <= pages; i++) {
                    queue.add(() => queryPageOfMonthOfYear(year, month, i));
                }
                queue.onIdle()
                .then((result) => { console.log('Ended queries for year: ' + year); startQueryYear(year + 1); })
                .catch((reason) => console.log('Failed because: ' + reason));
            }, function(reason) {
                console.error(err);
            });
        }
    });
}

function startQueryYear(year) {
    if (year > endYear || year < startYear) {
        return;
    }
    
    let csv = '';

    fields.forEach(field => {
        csv += '"' + field + '",';
    });

    csv = csv.substr(0, csv.length - 1) + '\n';

    fs.writeFile('./outputs/2/queries_' + year + '.csv', csv, function(err) {
        if (err) {
            return console.log(err);
        }
    });
    
    queryYear(year);
}

startQueryYear(startYear);