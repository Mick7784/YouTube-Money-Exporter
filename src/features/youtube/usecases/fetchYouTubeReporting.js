const youtubeReportingDatasource = require('../data/youtubeReportingDatasource');
const { set } = require('../../../utils/cache');

exports.fetchYouTubeReporting = async () => {
    const data = await youtubeReportingDatasource.getYouTubeReportingData();

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
        }
    };

    set(result, 'youtubeReporting.json', '../features/youtube/cache');

    return result;
}