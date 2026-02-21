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
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error creating user',
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
          message: 'Login and password are required',
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
        message: 'Authentication successful',
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '2h',
        user,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials',
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
        message: error.message || 'User not found',
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
        message: error.message || 'User not found',
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
        message: error.message || 'Error retrieving users',
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
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating user',
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
        message: 'User deleted successfully',
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'User not found',
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
        message: error.message || 'Error retrieving users by role',
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
        message: error.message || 'Error retrieving users by status',
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
        message: 'Status updated successfully',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating status',
      });
    }
  }

  // Mettre à jour le solde
  async updateSolde(req, res) {
    try {
      const { id } = req.params;
      const { amount, type } = req.body;

      const user = await userService.updateUserSolde(id, amount, type);
      
      return res.status(200).json({
        success: true,
        message: 'Solde updated successfully',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating user solde',
      });
    }
  }
}

module.exports = new UserController();
