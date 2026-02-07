const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'change_this_secret';

const authenticateToken = (req, res, next) => {
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
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expire',
    });
  }
};

module.exports = {
  authenticateToken,
};
