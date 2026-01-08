const router = require('express').Router();

const { get } = require('../../utils/cache');
const { fetchAmazonAffiliation } = require('./usecases/fetchAmazonAffiliation');

router.get('/', async (req, res) => {
    try {
        const data = await fetchAmazonAffiliation();
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
        const cachedData = await get('amazonAffiliation.json', '../features/amazon/cache');
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