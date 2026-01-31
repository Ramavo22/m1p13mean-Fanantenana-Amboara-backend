const express = require('express');
const userController = require('./user.controller');
const UserDTO = require('./user.dto');

const router = express.Router();

// Middleware de validation pour créer un utilisateur
const validateCreateUser = (req, res, next) => {
  const validation = UserDTO.validateCreateUser(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: validation.errors,
    });
  }
  req.body = UserDTO.createUserDTO(req.body);
  next();
};

// Middleware de validation pour mettre à jour un utilisateur
const validateUpdateUser = (req, res, next) => {
  const validation = UserDTO.validateUpdateUser(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: validation.errors,
    });
  }
  req.body = UserDTO.updateUserDTO(req.body);
  next();
};

// Routes
// Créer un utilisateur
router.post('/', validateCreateUser, (req, res) => userController.create(req, res));

// Récupérer tous les utilisateurs
router.get('/', (req, res) => userController.getAll(req, res));

// Récupérer les utilisateurs par rôle
router.get('/role/:role', (req, res) => userController.getByRole(req, res));

// Récupérer les utilisateurs par statut
router.get('/status/:status', (req, res) => userController.getByStatus(req, res));

// Récupérer un utilisateur par login
router.get('/login/:login', (req, res) => userController.getByLogin(req, res));

// Récupérer un utilisateur par ID
router.get('/:id', (req, res) => userController.getById(req, res));

// Mettre à jour un utilisateur
router.put('/:id', validateUpdateUser, (req, res) => userController.update(req, res));

// Changer le statut d'un utilisateur
router.patch('/:id/status', (req, res) => userController.changeStatus(req, res));

// Mettre à jour le solde d'un utilisateur
router.patch('/:id/solde', (req, res) => userController.updateSolde(req, res));

// Supprimer un utilisateur
router.delete('/:id', (req, res) => userController.delete(req, res));

module.exports = router;
