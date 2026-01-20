const datasource = require('./datasource');
const cache = require('../../utils/cache');

exports.fetchDomadooAffiliation = async () => {
    console.log("🌐 Fetching Domadoo data...");

    const data = await datasource.openDomadooAffiliationPageAndFindData();
    const result = {
        ...data,
        lastUpdate: new Date().toISOString(),
    };
    
    cache.set(result, 'domadoo.json');

    return result;
};
