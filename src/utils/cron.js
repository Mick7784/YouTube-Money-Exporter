const cron = require('node-cron');

exports.eachDay = (callback, name) => {
    this.initCron(callback, '0 0 * * *', name);
}

exports.eachHour = (callback, name) => {
    this.initCron(callback, '0 * * * *', name);
}

exports.initCron = (callback, period, name) => {
    cron.schedule(period, () => {
        callback();
    });
    console.log(`✅ ${name} scheduled cron jobs initialized.`);
}   