const { google } = require('googleapis');

exports.getYouTubeReportingData = async () => {
  const auth = new google.auth.OAuth2(
    process.env.GCP_CLIENT_ID,
    process.env.GCP_CLIENT_SECRET,
  );

  auth.setCredentials({
    refresh_token: process.env.GCP_REFRESH_TOKEN,
  });

  const youtube = google.youtube({ version: 'v3', auth });
  const analytics = google.youtubeAnalytics({ version: 'v2', auth });
  
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const prev = new Date();
    prev.setDate(prev.getDate() - 30);
    const startDate = prev.toISOString().split('T')[0];

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const channel = await youtube.channels.list({ part: 'statistics', mine: true });

    const report = await analytics.reports.query({
      ids: 'channel==MINE',
      startDate: startDate,
      endDate: today,
      metrics: 'views,estimatedMinutesWatched,subscribersGained,estimatedRevenue'
    });

    const currentMonthReport = await analytics.reports.query({
      ids: 'channel==MINE',
      startDate: firstDayOfMonth,
      endDate: today,
      metrics: 'estimatedRevenue'
    });

    const result = {
      totalSubscribers: channel.data.items[0].statistics.subscriberCount,
      last30Days: report.data.rows[0],
      currentMonthRevenue: currentMonthReport.data.rows?.[0]?.[0],
    };

    return result;

  } catch (err) {
    console.error("Erreur détaillée:", err.response?.data || err.message);
  }
};

