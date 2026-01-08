const cheerio = require('cheerio');
const datasource = require('./datasource');
const cache = require('../../utils/cache');

exports.fetchDomadooAffiliation = async () => {
    console.log("🌐 Fetching Domadoo data...");

    const data = await datasource.fetchDomadooAffiliateData();

    const $ = cheerio.load(data);
    
    const last30days = {
        clicks: $("#myaffiliateaccount-summary .list-group-hover div:nth-child(1) span.pull-xs-right").first().text().trim(),
        waitingSales: $("#myaffiliateaccount-summary .list-group-hover div:nth-child(3) span.pull-xs-right").first().text().trim(),
        approvedSales: $("#myaffiliateaccount-summary .list-group-hover div:nth-child(4) span.pull-xs-right").first().text().trim(),
        earnings: $("#myaffiliateaccount-summary .list-group-hover div:nth-child(5) span.pull-xs-right").first().text().trim(),
    }

    const total = {
        clicks:  $("#myaffiliateaccount-summary .list-group-hover div:nth-child(1) span.pull-xs-right").eq(1).text().trim(),
        approvedSales: $("#myaffiliateaccount-summary .list-group-hover div:nth-child(3) span.pull-xs-right").eq(1).text().trim(),  
        earnings: $("#myaffiliateaccount-summary .list-group-hover div:nth-child(4) span.pull-xs-right").eq(1).text().trim(),  
        waitingPayments: $("#myaffiliateaccount-summary .list-group-hover div:nth-child(6) span.pull-xs-right").first().text().trim(),  
        balance: $("#myaffiliateaccount-summary .list-group-hover div:nth-child(7) span.pull-xs-right").first().text().trim(),  
    }

    const result = {
        last30days,
        total,
        lastUpdate: new Date().toISOString(),
    };

    cache.set(result, 'domadoo.json');

    return result;
};
