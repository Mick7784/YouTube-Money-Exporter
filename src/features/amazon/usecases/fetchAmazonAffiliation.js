const cheerio = require('cheerio');
const amazonDatasource = require('../data/amazonDatasource');
const { set } = require('../../../utils/cache');

exports.fetchAmazonAffiliation = async () => {
    const reporting = await amazonDatasource.fetchAmazonReporting();
    const history = await amazonDatasource.fetchAmazonPaymentHistory();

    const $reporting = cheerio.load(reporting);
    const $history = cheerio.load(history);

    const result = {
        thisMonth: {
            clicks: $reporting("#ac-report-commission-commision-clicks").text().trim(),
            itemsOrdered: $reporting("#ac-report-commission-commision-ordered").text().trim(),
            earnings: $reporting("#ac-report-commission-commision-total").text().trim().replace('€', '').trim() + ' €',
        },
        waitingPayments: $history("#payment-cards-section div div:nth-child(2) a span span").text().trim(),
    };

    set(result, 'amazonAffiliation.json', '../features/amazon/cache');

    return result;
};
