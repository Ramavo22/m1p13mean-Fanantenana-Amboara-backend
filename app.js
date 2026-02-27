const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/config/swagger');
const connectDB = require('./src/config/database');
require('dotenv').config();
const path = require('path');

// Importer les routes
const userRoutes = require('./src/modules/users/user.routes');
const boxRoutes = require('./src/modules/boxes/box.routes');
const shopRoutes = require('./src/modules/shops/shop.routes');
const productTypeRoutes = require('./src/modules/product-types/product-type.routes');
const productRoutes = require('./src/modules/products/product.routes');
const transactionRoutes = require('./src/modules/transactions/transaction.routes');
const rentRoutes = require('./src/modules/rents/rent.routes');
const storageRoutes = require('./src/modules/storage/storage.routes');  
const panierRoutes = require('./src/modules/panier/panier.routes');

// Créer l'application Express
const app = express();

connectDB();

// Middleware
app.use(cors());
// Servir les fichiers statiques (pour la page statique /api-docs et swagger.json)
app.use(express.static(path.join(__dirname, 'public')));
// Parser le JSON et les formulaires URL-encoded (pas multipart/form-data, géré par multer)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI configuration
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCss: `
    .topbar { display: none; }
    .swagger-ui .topbar { display: flex; }
  `,
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/boxes',boxRoutes);
app.use('/api/shops',shopRoutes);
app.use('/api/product-types',productTypeRoutes);
app.use('/api/products',productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rents', rentRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/paniers', panierRoutes);

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

// Gestion des erreurs globales (y compris multer)
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  
  // Erreur multer
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est trop volumineux (5MB max)'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erreur d'upload: ${err.message}`
    });
  }
  
  // Autres erreurs
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne'
  });
});

module.exports = app;
