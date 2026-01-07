const cron = require('node-cron');

const initCrons = () => {
    // Exemple : S'exécute toutes les 5 minutes
    cron.schedule('*/5 * * * *', () => {
        console.log(`[CRON] Exécution automatique le : ${new Date().toLocaleTimeString()}`);
        // Ajoute ta logique ici (ex: fetch une donnée, nettoyer un fichier...)
    });

    console.log("✅ Gestionnaire de tâches planifiées activé.");
};

module.exports = initCrons;