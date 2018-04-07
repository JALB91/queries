import * as flickr from './flickr';
import * as params from './params';
import { DAY_IN_MONTHS } from './months';
import bbox from './bbox';

const MAX_RESULT = 4000;
const year = 2015;

async function main() {
    for (let month = 12; month <= 12; month++) {
        let monthKey = month < 10 ? '0' + month : month.toString();
        console.log(`Querying month ${monthKey}`);
        for (let day = 1; day <= parseInt(DAY_IN_MONTHS[monthKey]); day++) {
            let dayKey = (day < 10 ? '0' + day : day.toString());
            console.log(`Querying day ${dayKey}`);

            const box = new bbox(0.117273, 40.511265, 3.358239, 42.897671);
            // const test = new bbox(0.0, 0.0, 100.0, 100.0);
            let iter = 0;
            let sections = 1;
            do {
                console.log('.'.repeat(Math.max(sections, 0)));
                const ended = box.removeSectionIfNeeded() && iter > 0;
                // test.removeSectionIfNeeded();
                // console.log(test.getDebugString());
                // console.log(box.getDebugString());

                if (ended) break;

                iter++;
                let parameters = params.getDefaultRequestParams(year, monthKey, dayKey, dayKey, box);
                try {
                    const result = await flickr.getQueryResult(parameters);
                    // console.log(result['body']['photos']['total']);
                    if (parseInt(result['body']['photos']['total']) >= MAX_RESULT && monthKey !== '07' && dayKey !== '15') {
                        box.addSection();
                        // test.addSection();
                        sections += 4;
                    } else {
                        for (let i = 1; i <= parseInt(result['body']['photos']['pages']); i++) {
                            parameters = params.getDefaultRequestParams(year, monthKey, dayKey, dayKey, box, i);
                            flickr.addToQueue(parameters);
                        }
                        sections -= 1;
                        box.goToNextSection();
                        // test.goToNextSection();
                    }
                } catch (e) {
                    console.warn(e);
                    break;
                }
            } while (!box.isEnded());
        }
    }
    
    flickr.startQueries(() => {
        console.log('ENDED');
    });
};

main();