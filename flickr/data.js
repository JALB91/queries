const fs = require('fs');
const json2csv = require('json2csv').parse;

const fields = ['owner', 'id', 'ownername', 'title', 'description', 'dateupload', 'datetaken', 'tags', 'latitude', 'longitude', 'url_o'];
const opts = { 'fields': fields, 'header': false };

const month = 12;


export const init_file = () => {
    let csv = '';
    fields.forEach(field => {
        csv += `"${field}",`;
    });

    csv = csv.substr(0, csv.length - 1) + '\n';

    fs.writeFile(`queries_2015_${month}.csv`, csv, function (err) {
        if (err) {
            return console.log(err);
        }
    });
};

export const append_result = (result) => {
    console.log('Writing results');
    result['photos']['photo'].forEach(element => {
        try {
            element['description'] = element['description']['_content'];
            fs.appendFile(`./queries_2015_${month}.csv`, json2csv(element, opts) + '\n', function (err) {
                if (err) {
                    return console.warn(err);
                }
            });
        } catch (err) {
            console.warn(err);
        }
    });
};