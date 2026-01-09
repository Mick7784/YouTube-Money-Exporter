const datasource = require('./datasource');
const cache = require('../../utils/cache');

exports.fetchYouTubeReporting = async () => {
    console.log("🌐 Fetching YouTube data...");
    const data = await datasource.getYouTubeReportingData();

    const result = {
        last30days: {
            views: String(data.last30Days[0]),
            estimatedHoursWatched: (Math.round((data.last30Days[1] / 60) * 100) / 100).toString(),
            averageViewDuration: String(Math.round((data.last30Days[2] / 60) * 100) / 100),
            subscribersGained: String(data.last30Days[3]),
            subscribersLost: String(data.last30Days[4]),
            likes: String(data.last30Days[5]),
            comments: String(data.last30Days[6]),
            shares: String(data.last30Days[7]),
            estimatedRevenue: (Math.round((data.last30Days[8]) * 100) / 100).toString() + ' €',
        },
        total: {
            subscribers: String(data.totalSubscribers),
        },
        thisMonth: {
            views: String(data.currentMonth[0]),
            estimatedHoursWatched: (Math.round((data.currentMonth[1] / 60) * 100) / 100).toString(),
            averageViewDuration: String(Math.round((data.currentMonth[2] / 60) * 100) / 100),
            subscribersGained: String(data.currentMonth[3]),
            subscribersLost: String(data.currentMonth[4]),
            likes: String(data.currentMonth[5]),
            comments: String(data.currentMonth[6]),
            shares: String(data.currentMonth[7]),
            estimatedRevenue: (Math.round((data.currentMonth[8]) * 100) / 100).toString() + ' €',
        },
        lastUpdate: new Date().toISOString(),
    };

    cache.set(result, 'youtube.json');

    return result;
}