const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/config/swagger');
require('dotenv').config();
const path = require('path');

// Importer les routes
const userRoutes = require('./src/modules/users/user.routes');
const boxRoutes = require('./src/modules/boxes/box.routes');
const shopRoutes = require('./src/modules/shops/shop.routes');
const productTypeRoutes = require('./src/modules/product-types/product-type.route');
const productRoutes = require('./src/modules/products/product.routes');
const transactionRoutes = require('./src/modules/transactions/transaction.routes');

// Créer l'application Express
const app = express();

// Middleware
app.use(cors());
// Servir les fichiers statiques (pour la page statique /api-docs et swagger.json)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
