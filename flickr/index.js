import * as flickr from './flickr';
import * as params from './params';
import { DAY_IN_MONTHS } from './months';
import bbox from './bbox';
const cli = require('cli');

const options = cli.parse({
    year: ['y', 'Year to query', 'int'],
    startMonth: ['sm', 'Month to query from', 'int', 1],
    endMonth: ['em', 'Month to query to', 'int', 12]
});

if (!options.hasOwnProperty('year')) {
    cli.fatal('No year specified');
}

const MAX_RESULT = 4000;
const year = options.year;

const startMonth = options.startMonth;
const endMonth = options.endMonth;


let totalSteps = 0;

Object.keys(DAY_IN_MONTHS).forEach(key => {
    if (parseInt(key) >= startMonth && parseInt(key) <= endMonth) {
        totalSteps += parseInt(DAY_IN_MONTHS[key]);
    }
});

let currentStep = 0;

async function main() {
    for (let month = startMonth; month <= endMonth; month++) {
        const monthKey = month < 10 ? '0' + month : month.toString();
        for (let day = 1; day <= parseInt(DAY_IN_MONTHS[monthKey]); day++) {
            const dayKey = (day < 10 ? '0' + day : day.toString());
            cli.spinner(`Querying ${year}-${monthKey}-${dayKey}`, true);
            process.stdout.moveCursor(0, - 1);
            cli.spinner(`Querying ${year}-${monthKey}-${dayKey}`);
            const box = new bbox(0.117273, 40.511265, 3.358239, 42.897671);
            let iter = 0;
            let sections = 1;
            do {
                const ended = box.removeSectionIfNeeded() && iter > 0;
                if (ended) break;
                iter++;
                let parameters = params.getDefaultRequestParams(year, monthKey, dayKey, dayKey, box);
                try {
                    const result = await flickr.getQueryResult(parameters);
                    if (parseInt(result['body']['photos']['total']) >= MAX_RESULT && sections < 40) {
                        box.addSection();
                        sections += 4;
                    } else {
                        for (let i = 1; i <= parseInt(result['body']['photos']['pages']); i++) {
                            parameters = params.getDefaultRequestParams(year, monthKey, dayKey, dayKey, box, i);
                            flickr.addToQueue(year, monthKey, parameters);
                        }
                        sections -= 1;
                        box.goToNextSection();
                    }
                } catch (e) {
                    cli.error(e);
                    break;
                }
            } while (!box.isEnded());
            currentStep++;
        }

        flickr.startQueries(year, monthKey, () => {
            cli.info(`Ended queries for month ${monthKey}`);
        });
    }
    cli.spinner('Querying Done', true);
};

main();