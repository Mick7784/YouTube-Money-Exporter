const cheerio = require('cheerio');
const domadooDatasource = require('../data/domadooDatasource');
const { set } = require('../../../utils/cache');

exports.fetchDomadooAffiliation = async () => {
    const data = await domadooDatasource.fetchDomadooAffiliateData();

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
        total
    };

    set(result, 'domadooAffiliation.json', '../features/domadoo/cache');

    return result;
};
