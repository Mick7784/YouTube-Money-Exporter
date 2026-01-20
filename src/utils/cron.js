const cron = require('node-cron');

exports.eachHour = (callback, name) => {
  exports.initCron(callback, '0 * * * *', name);
};

// Daily at 03:17 (avoid collisions with hourly jobs)
exports.eachDay = (callback, name) => {
  exports.initCron(callback, '17 3 * * *', name);
};

exports.initCron = (callback, period, name) => {
  cron.schedule(period, async () => {
    try {
      await callback();
    } catch (e) {
      console.error(`❌ ${name} cron error:`, e);
    }
  });
  console.log(`✅ ${name} scheduled cron jobs initialized.`);
};
