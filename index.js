const express = require('express');
const initCrons = require('./src/crons/crons');
const domadoo = require('./src/features/domadoo/domadooController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour lire le JSON
app.use(express.json());

// --- ROUTES API ---
app.use('/api/domadoo', domadoo);

// --- DÉMARRAGE ---
app.listen(PORT, () => {
    console.log(`🚀 Serveur API lancé sur http://localhost:${PORT}`);
    
    // Lancement des crons une fois que le serveur est prêt
    initCrons();
});