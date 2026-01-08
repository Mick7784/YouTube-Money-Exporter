const { default: axios } = require("axios");

exports.fetchDomadooAffiliateData = async () => {
    const url = "https://www.domadoo.fr/fr/affiliation"
    const cookie = process.env.DOMADOO_COOKIE;

    return await axios.get(url, {
        headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/',
            'Accept': 'text/html',
        },
        responseType: 'text'
    })
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.error("❌ Erreur lors de la récupération des données d'affiliation Domadoo :", error.message);
    });
};

