const express = require('express');
const initCrons = require('./src/crons/crons');
const main = require('./src/features/mainController');
const domadoo = require('./src/features/domadoo/domadooController');
const youtube = require('./src/features/youtube/youtubeController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour lire le JSON
app.use(express.json());

// --- ROUTES API ---
app.use('/api/', main);
app.use('/api/domadoo', domadoo);
app.use('/api/youtube', youtube);


// --- DÉMARRAGE ---
app.listen(PORT, () => {
    console.log(`🚀 Serveur API lancé sur http://localhost:${PORT}`);
    
    // Lancement des crons une fois que le serveur est prêt
    initCrons();
});