const router = require('express').Router();

const { get } = require('../../utils/cache');
const { fetchYouTubeReporting } = require('./usecases/fetchYouTubeReporting');

router.get('/', async (req, res) => {
    try {
        const data = await fetchYouTubeReporting();
        res.json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données YouTube.' 
        });
    }
});

router.get('/last', async (req, res) => {
    try {
        const cachedData = await get('youtubeReporting.json', '../features/youtube/cache');
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