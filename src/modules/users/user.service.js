const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');

class UserService {
  // Créer un utilisateur
  async createUser(userData) {
    // Vérifier si le login existe déjà
    const loginExists = await userRepository.loginExists(userData.login);
    if (loginExists) {
      throw new Error('Ce login est déjà utilisé');
    }

    // Vérifier si l'email existe (si fourni)
    if (userData.profile?.email) {
      const emailExists = await userRepository.emailExists(userData.profile.email);
      if (emailExists) {
        throw new Error('Cet email est déjà utilisé');
      }
    }

    // Hasher le mot de passe avant de sauvegarder
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    return await userRepository.create(userData);
  }

  // Récupérer un utilisateur par ID
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    return user;
  }

  // Récupérer un utilisateur par login
  async getUserByLogin(login) {
    const user = await userRepository.findByLogin(login);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    return user;
  }

  // Récupérer tous les utilisateurs
  async getAllUsers(filters = {}, page = 1, limit = 10) {
    return await userRepository.findAll(filters, page, limit);
  }

  // Mettre à jour un utilisateur
  async updateUser(userId, updateData) {
    // Vérifier que l'utilisateur existe
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier unicité du login si modifié
    if (updateData.login && updateData.login !== user.login) {
      const loginExists = await userRepository.loginExists(updateData.login);
      if (loginExists) {
        throw new Error('Ce login est déjà utilisé');
      }
    }

    // Vérifier unicité de l'email si modifié
    if (updateData.profile?.email) {
      const emailExists = await userRepository.emailExists(updateData.profile.email);
      if (emailExists) {
        throw new Error('Cet email est déjà utilisé');
      }
    }

    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    return await userRepository.update(userId, updateData);
  }

  // Supprimer un utilisateur
  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    return await userRepository.delete(userId);
  }

  // Récupérer les utilisateurs par rôle
  async getUsersByRole(role) {
    const validRoles = ['ADMIN', 'BOUTIQUE', 'ACHETEUR'];
    if (!validRoles.includes(role)) {
      throw new Error('Rôle invalide');
    }
    return await userRepository.findByRole(role);
  }

  // Récupérer les utilisateurs par statut
  async getUsersByStatus(status) {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Statut invalide');
    }
    return await userRepository.findByStatus(status);
  }

  // Changer le statut d'un utilisateur
  async changeUserStatus(userId, newStatus) {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Statut invalide');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return await userRepository.update(userId, { status: newStatus });
  }

  // Mettre à jour le solde
  async updateUserSolde(userId, amount) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const currentSolde = user.profile.solde || 0;
    const newSolde = currentSolde + amount;

    if (newSolde < 0) {
      throw new Error('Solde insuffisant');
    }

    return await userRepository.update(userId, {
      'profile.solde': newSolde,
    });
  }

  // Authentifier un utilisateur via login et mot de passe
  async authenticateUser(login, password) {
    const user = await userRepository.findByLoginWithPassword(login);
    if (!user) {
      throw new Error('Identifiants invalides');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Compte inactif');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Identifiants invalides');
    }

    const userData = user.toObject();
    delete userData.password;
    return userData;
  }
}

module.exports = new UserService();
