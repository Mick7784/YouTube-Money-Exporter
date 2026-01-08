const cron = require('../../utils/cron');
const router = require('express').Router();
const cache = require('../../utils/cache');
const service = require('./service');

// Init scheduled task
cron.eachDay(service.fetchAmazonAffiliation, 'Amazon');

// Routes
router.get('/', async (req, res) => {
    try {
        const data = await service.fetchAmazonAffiliation();
        res.json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données Amazon.' 
        });
    }
});

router.get('/last', async (req, res) => {
    try {
        const cachedData = await cache.get('amazon.json', '../features/amazon/cache');
        if (cachedData) {
            res.json({ data: cachedData });
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