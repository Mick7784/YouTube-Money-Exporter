const datasource = require('./datasource');
const cache = require('../../utils/cache');

exports.fetchYouTubeReporting = async () => {
    console.log("🌐 Fetching YouTube data...");
    const data = await datasource.getYouTubeReportingData();

    const result = {
        last30days: {
            views: String(data.last30Days[0]),
            estimatedHoursWatched: (Math.round((data.last30Days[1] / 60) * 100) / 100).toString(),
            subscribersGained: String(data.last30Days[2]),
            estimatedRevenue: (Math.round((data.last30Days[3]) * 100) / 100).toString() + ' €',
        },
        total: {
            subscribers: String(data.totalSubscribers),
        },
        thisMonth: {
            estimatedRevenue: (Math.round((data.currentMonthRevenue) * 100) / 100).toString() + ' €',
        },
        lastUpdate: new Date().toISOString(),
    };

    cache.set(result, 'youtube.json');

    return result;
}