const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importer les routes
const userRoutes = require('./src/modules/users/user.routes');
const boxRoutes = require('./src/modules/boxes/box.routes');
const shopRoutes = require('./src/modules/shops/shop.routes');

// Créer l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/box',boxRoutes);
app.use('/api/shop',shopRoutes);

// Route de base
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenue sur l\'API de gestion des utilisateurs',
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

module.exports = app;
