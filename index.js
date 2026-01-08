require('dotenv').config({debug: true});

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware pour lire le JSON
app.use(express.json());

// --- ROUTES API ---
// You can remove the providers you don't need
app.use('/api/', require('./src/features/controller'));
app.use('/api/amazon', require('./src/features/amazon/controller'));
app.use('/api/domadoo', require('./src/features/domadoo/controller'));
app.use('/api/youtube', require('./src/features/youtube/controller'));


// --- DÉMARRAGE ---
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});