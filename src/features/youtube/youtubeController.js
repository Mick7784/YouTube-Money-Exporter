const router = require('express').Router();
const {fetchYouTubeReporting} = require('./usecases/fetchYouTubeReporting');

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

module.exports = router;