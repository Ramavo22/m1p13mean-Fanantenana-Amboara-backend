const jwt = require('jsonwebtoken');
const User = require('../modules/users/users.model');

const getJwtSecret = () => process.env.JWT_SECRET || 'change_this_secret';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token manquant ou invalide',
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    
    // Vérifier le statut du compte dans la base de données
    const user = await User.findById(decoded.sub).select('status');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Compte inactif ou suspendu',
      });
    }
    
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expire',
    });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acces refuse',
    });
  }
  return next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
