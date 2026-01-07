const router = require('express').Router();
const { get } = require('../utils/cache');
const { fetchYouTubeReporting } = require('./youtube/usecases/fetchYouTubeReporting');
const { fetchDomadooAffiliation } = require('./domadoo/usecases/fetchDomadooAffiliation');

router.get('/', async (req, res) => {
    try {
        const youtube = await get('youtubeReporting.json', '../features/youtube/cache');
        const domadoo = await get('domadooAffiliation.json', '../features/domadoo/cache');
        res.json({ youtube, domadoo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données globales.' 
        });
    }
});

router.patch('/refresh', async (req, res) => {
    try {
        fetchYouTubeReporting();
        fetchDomadooAffiliation();
        
        res.json("Mise à jour des données globales lancée.");
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Erreur lors de la mise à jour des données globales.' 
        });
    }
});

module.exports = router;