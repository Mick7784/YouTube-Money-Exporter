const router = require('express').Router();
const { get } = require('../utils/cache');

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

module.exports = router;