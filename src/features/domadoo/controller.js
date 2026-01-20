const cron = require('../../utils/cron');
const router = require('express').Router();
const cache = require('../../utils/cache');
const service = require('./service');

// Init scheduled task
cron.eachHour(service.fetchDomadooAffiliation, 'Domadoo');

// Launch first fetch immediately
service.fetchDomadooAffiliation();

// Routes
router.get('/', async (req, res) => {
    try {
        const data = await service.fetchDomadooAffiliation();
        res.json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données Domadoo.' 
        });
    }
});

router.get('/last', async (req, res) => {
    try {
        const cachedData = await cache.get('domadoo.json');
        if (cachedData) {
            res.json(cachedData);
        } else {
            res.status(404).json({ error: 'Aucune donnée en cache trouvée.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données en cache.' 
        });
    }
});

module.exports = router;