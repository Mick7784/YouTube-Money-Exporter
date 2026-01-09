const datasource = require('./datasource');
const cache = require('../../utils/cache');

exports.fetchAmazonAffiliation = async () => {
    console.log("🌐 Fetching Amazon data...");

    const reporting = await datasource.openAmazonReportingPageAndFindData();

    const result = {
        ...reporting,
        lastUpdate: new Date().toISOString(),
    };

    cache.set(result, 'amazon.json');

    return result;
};
