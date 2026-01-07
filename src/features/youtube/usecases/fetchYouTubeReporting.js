const youtubeReportingDatasource = require('../data/youtubeReportingDatasource');

exports.fetchYouTubeReporting = async () => {
    const data = await youtubeReportingDatasource.getYouTubeReportingData();

    return {
        subscribers: String(data.totalSubscribers),
        revenueThisMonth: (Math.round((data.currentMonthRevenue) * 100) / 100).toString() + ' €',
        last30days: {
            views: String(data.last30Days[0]),
            estimatedHoursWatched: (Math.round((data.last30Days[1] / 60) * 100) / 100).toString(),
            subscribersGained: String(data.last30Days[2]),
            estimatedRevenue: (Math.round((data.last30Days[3]) * 100) / 100).toString() + ' €',
        }
    };
}