const { default: axios } = require("axios");

exports.fetchAmazonReporting = async () => {
    const url = process.env.AMAZON_REPORTING_URL;
    const cookie = process.env.AMAZON_COOKIE;

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
        console.error("❌ Erreur lors de la récupération des données d'affiliation Amazon :", error.message);
    });
};

exports.fetchAmazonPaymentHistory = async () => {
    const url = "https://partenaires.amazon.fr/home/account/paymentHistory";
    const cookie = process.env.AMAZON_COOKIE;

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
        console.error("❌ Erreur lors de la récupération des données d'affiliation Amazon :", error.message);
    });
};

