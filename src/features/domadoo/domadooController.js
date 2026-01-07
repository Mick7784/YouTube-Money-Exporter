const router = require('express').Router();

const { fetchDomadooAffiliation } = require('./usecases/fetchDomadooAffiliation');

router.get('/', async (req, res) => {
    try {
        const data = await fetchDomadooAffiliation();
        res.json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données Domadoo.' 
        });
    }
});

module.exports = router;