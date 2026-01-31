require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Connecter à la base de données et démarrer le serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`✓ Serveur démarré sur le port ${PORT}`);
      console.log(`✓ L'API est disponible sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Erreur au démarrage du serveur:', error.message);
    process.exit(1);
  }
};

startServer();
