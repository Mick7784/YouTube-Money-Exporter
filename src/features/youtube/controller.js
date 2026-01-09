const cron = require('../../utils/cron');
const router = require('express').Router();
const cache = require('../../utils/cache');
const service = require('./service');

// Init scheduled task
cron.eachDay(service.fetchYouTubeReporting, 'YouTube');

// Routes
router.get('/', async (req, res) => {
    try {
        const data = await service.fetchYouTubeReporting();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données YouTube.' 
        });
    }
});

router.get('/last', async (req, res) => {
    try {
        const cachedData = await cache.get('youtube.json', '../features/youtube/cache');
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