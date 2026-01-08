require('dotenv').config();

const express = require('express');
const initCrons = require('./src/crons/crons');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour lire le JSON
app.use(express.json());

// --- ROUTES API ---
app.use('/api/', require('./src/features/mainController'));
app.use('/api/amazon', require('./src/features/amazon/amazonController'));
app.use('/api/domadoo', require('./src/features/domadoo/domadooController'));
app.use('/api/youtube', require('./src/features/youtube/youtubeController'));


// --- DÉMARRAGE ---
app.listen(PORT, () => {
    console.log(`🚀 Serveur API lancé sur http://localhost:${PORT}`);
    
    // Lancement des crons une fois que le serveur est prêt
    initCrons();
});