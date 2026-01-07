const cron = require('node-cron');
const { fetchYouTubeReporting } = require('../features/youtube/usecases/fetchYouTubeReporting');
const { fetchDomadooAffiliation } = require('../features/domadoo/usecases/fetchDomadooAffiliation');

const initCrons = () => {
    // Exemple : S'exécute toutes les heures
    cron.schedule('0 * * * *', () => {
        console.log("🔄 Exécution des tâches planifiées...");
        fetchYouTubeReporting();
        fetchDomadooAffiliation();
    });
    console.log("✅ Gestionnaire de tâches planifiées activé.");
};

module.exports = initCrons;