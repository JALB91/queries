/*
    Luoghi di interesse

    Jardins de Sant Pau del Camp    -> 'ChIJBZuNU1mipBIRID5RH-H6AA8'
    Parc del Port Olimpic           -> 'ChIJabWD-Q2jpBIRTnWyNcS1RWw'
    Parc de les Cascades            -> 'ChIJxc_haA-jpBIRRbZuZSSrJx0'
    Parc de la Nova Icària          -> 'ChIJweED9RKjpBIR_wbBiKtTxhM'
    Parc de Carles I                -> 'ChIJx-euaAWjpBIRGfVosdoHSP4'
    Parc de Sant Martí              -> 'ChIJXa4QtjKjpBIRM1z2Kx5MHdo'
    Parc del Poblenou               -> 'ChIJyQUYWGujpBIRb9wF2fi0xmw'
    Parc de Can Dragó               -> 'ChIJ97ocMye9pBIRibw3hrjxqmA'
    Parc de la Trinitat             -> 'ChIJSaBJvO-8pBIRt65w-N2_cSg'
    Jardins Princep de Girona       -> 'ChIJvbo4PsaipBIRX4EWvNCefdA'
    Parc de la Barceloneta          -> 'ChIJ12cYsQejpBIR4EFRH-H6AA8'
    Parc Josep M. Serra i Martí     -> ''
    Parc de Nou Barris              -> 'ChIJA_JuQD-9pBIRAEBRH-H6AA8'
    Jardins de Rosa Luxemburg       -> 'ChIJ8_OSYlq9pBIRBMCW4JZhugU'
    Parc de la Maquinista           -> 'ChIJG7FZasO8pBIRED9RH-H6AA8'
    Parc de Diagonal Mar            -> 'ChIJ26mCL0WjpBIRCB2xUmNvpBM'
    Parc Lineal Garcia Fària        ->
    Parc dels Auditoris             ->

    Dati di interesse:
        response['geometry']['location']
        response['reviews'][n]['author_url']
        response['reviews'][n]['language']
        response['reviews'][n]['rating']
        response['reviews'][n]['relative_time_description']
        response['reviews'][n]['text']
        response['reviews'][n]['time']
        response['url']
*/

const fs = require('fs');
const json2csv = require('json2csv').parse;
let PlaceSearch = require('../node_modules/googleplaces/lib/PlaceSearch.js');
let PlaceDetailsRequest = require('../node_modules/googleplaces/lib/PlaceDetailsRequest.js');
let config = require("./config.js");

let placeSearch = new PlaceSearch(config.apiKey, config.outputFormat);
let placeDetailsRequest = new PlaceDetailsRequest(config.apiKey, config.outputFormat);

const fields = ['location', 'auth_url', 'auth_lang', 'auth_rating', 'auth_rtime', 'auth_text', 'auth_time', 'url'];
const opts = { 'fields': fields, 'header': false };

const allPlacesIds = [
    'ChIJBZuNU1mipBIRID5RH-H6AA8',
    'ChIJabWD-Q2jpBIRTnWyNcS1RWw',
    'ChIJxc_haA-jpBIRRbZuZSSrJx0',
    'ChIJweED9RKjpBIR_wbBiKtTxhM',
    'ChIJx-euaAWjpBIRGfVosdoHSP4',
    'ChIJXa4QtjKjpBIRM1z2Kx5MHdo',
    'ChIJyQUYWGujpBIRb9wF2fi0xmw',
    'ChIJ97ocMye9pBIRibw3hrjxqmA',
    'ChIJSaBJvO-8pBIRt65w-N2_cSg',
    'ChIJvbo4PsaipBIRX4EWvNCefdA',
    'ChIJ12cYsQejpBIR4EFRH-H6AA8',
    'ChIJA_JuQD-9pBIRAEBRH-H6AA8',
    'ChIJ8_OSYlq9pBIRBMCW4JZhugU',
    'ChIJG7FZasO8pBIRED9RH-H6AA8',
    'ChIJ26mCL0WjpBIRCB2xUmNvpBM'
];

allPlacesIds.forEach(placeId => {
    console.log('Querying place id: ' + placeId);
    placeDetailsRequest({ placeid: placeId }, function (error, response) {
        if (error) throw error;
        if (response.status !== "OK") {
            console.log("ERROR STATUS: " + response.status);
        }
    
        let data = [];
    
        if (response['result'].hasOwnProperty('reviews')) {
            response['result']['reviews'].forEach(element => {
                const location = response['result']['geometry']['location'];
                const auth_url = element['author_url'];
                const auth_lang = element['language'];
                const auth_rating = element['rating'];
                const auth_rtime = element['relative_time_description'];
                const auth_text = element['text'];
                const auth_time = element['time'];
                const url = response['result']['url'];
        
                data.push({location, auth_url, auth_lang, auth_rating, auth_rtime, auth_text, auth_time, url});
            });
        }
    
        let csv = "";
    
        fields.forEach(field => {
            csv += '"' + field + '",';
        });
    
        csv = csv.substr(0, csv.length - 1) + '\n';
    
        data.forEach(element => {
            csv += json2csv(element, opts) + '\n';
        })
    
        fs.writeFile("./outputs/queries_" + placeId + ".csv", csv, function(err) {
            if (err) {
                return console.log(err);
            }
        });
    });
});