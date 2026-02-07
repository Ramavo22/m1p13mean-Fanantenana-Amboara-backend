const jwt = require('jsonwebtoken');
const userService = require('./user.service');

const getJwtSecret = () => process.env.JWT_SECRET || 'change_this_secret';

class UserController {
  // Créer un utilisateur
  async create(req, res) {
    try {
      const userData = req.body;
      const user = await userService.createUser(userData);
      
      return res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création de l\'utilisateur',
      });
    }
  }

  // Authentifier un utilisateur (login + password)
  async login(req, res) {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({
          success: false,
          message: 'Login et mot de passe requis',
        });
      }

      const user = await userService.authenticateUser(login, password);

      const token = jwt.sign(
        { sub: user._id, login: user.login, role: user.role },
        getJwtSecret(),
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Authentification reussie',
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '2h',
        user,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Identifiants invalides',
      });
    }
  }

  // Récupérer un utilisateur par ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Utilisateur non trouvé',
      });
    }
  }

  // Récupérer un utilisateur par login
  async getByLogin(req, res) {
    try {
      const { login } = req.params;
      const user = await userService.getUserByLogin(login);
      
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Utilisateur non trouvé',
      });
    }
  }

  // Récupérer tous les utilisateurs
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, role, status } = req.query;
      
      const filters = {};
      if (role) filters.role = role;
      if (status) filters.status = status;

      const result = await userService.getAllUsers(
        filters,
        parseInt(page),
        parseInt(limit)
      );
      
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des utilisateurs',
      });
    }
  }

  // Mettre à jour un utilisateur
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const user = await userService.updateUser(id, updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Utilisateur mis à jour avec succès',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de l\'utilisateur',
      });
    }
  }

  // Supprimer un utilisateur
  async delete(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      
      return res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès',
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Utilisateur non trouvé',
      });
    }
  }

  // Récupérer les utilisateurs par rôle
  async getByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await userService.getUsersByRole(role);
      
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des utilisateurs',
      });
    }
  }

  // Récupérer les utilisateurs par statut
  async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const users = await userService.getUsersByStatus(status);
      
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des utilisateurs',
      });
    }
  }

  // Changer le statut
  async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const user = await userService.changeUserStatus(id, status);
      
      return res.status(200).json({
        success: true,
        message: 'Statut mis à jour avec succès',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du statut',
      });
    }
  }

  // Mettre à jour le solde
  async updateSolde(req, res) {
    try {
      const { id } = req.params;
      const { amount, type } = req.body;
      
      if (typeof amount !== 'number' || Number.isNaN(amount)) {
        return res.status(400).json({
          success: false,
          message: 'Le montant doit être un nombre',
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Le montant doit être supérieur à zéro',
        });
      }

      if (!['ACHAT', 'RECHARGE'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type de transaction invalide',
        });
      }

      const user = await userService.updateUserSolde(id, amount, type);
      
      return res.status(200).json({
        success: true,
        message: 'Solde mis à jour avec succès',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du solde',
      });
    }
  }
}

module.exports = new UserController();
