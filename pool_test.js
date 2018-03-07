let PromisePool = require('es6-promise-pool');
let text = "";

const promiseProducer = function * () {
    for (let i = 0; i < 5; i++) {
        yield new Promise(function() {
            console.log("RESOLVED: " + i);
            text += "Resolved " + i + "\n";
            this.resolve();
        }, function() {
            console.log("NOT RESOLVED");
            text += "Failed " + i + "\n";
            this.reject();
        });
    }
}

const iterator = promiseProducer();

function logResult() {
    console.log(text);
}

let pool = new PromisePool(iterator, 4);
pool.start().then(() => { console.log("DONE"); }, () => { console.log("FAIL"); });