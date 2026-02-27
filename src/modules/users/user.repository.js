const User = require('./users.model');

class UserRepository {
  // Créer un nouvel utilisateur
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // Récupérer un utilisateur par ID
  async findById(userId) {
    return await User.findById(userId).select('-password');
  }

  // Récupérer un utilisateur par login
  async findByLogin(login) {
    return await User.findOne({ login }).select('-password');
  }

  // Récupérer un utilisateur par login (avec mot de passe pour auth)
  async findByLoginWithPassword(login) {
    return await User.findOne({ login });
  }

  // Récupérer un utilisateur par email
  async findByEmail(email) {
    return await User.findOne({ 'profile.email': email }).select('-password');
  }

  // Récupérer tous les utilisateurs
  async findAll(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(filter);
    
    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Mettre à jour un utilisateur
  async update(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
  }

  // Supprimer un utilisateur
  async delete(userId) {
    return await User.findByIdAndDelete(userId);
  }

  // Chercher par rôle
  async findByRole(role) {
    return await User.find({ role }).select('-password');
  }

  // Chercher par statut
  async findByStatus(status) {
    return await User.find({ status }).select('-password');
  }

  // Vérifier si un login existe
  async loginExists(login) {
    const user = await User.findOne({ login });
    return !!user;
  }

  // Récupérer un utilisateur par ID dans une session MongoDB
  async findByIdInSession(userId, session) {
    return await User.findById(userId).session(session).select('-password');
  }

  // Décrémenter atomiquement le solde d'un utilisateur
  async decrementSolde(userId, amount, session = null) {
    return await User.findByIdAndUpdate(
      userId,
      { $inc: { 'profile.solde': -amount } },
      { new: true, runValidators: true, ...(session ? { session } : {}) }
    ).select('-password');
  }

  // Ré-créditer le solde (rollback)
  async incrementSolde(userId, amount) {
    return await User.findByIdAndUpdate(
      userId,
      { $inc: { 'profile.solde': amount } },
      { new: true }
    ).select('-password');
  }

  // Vérifier si un email existe
  async emailExists(email) {
    const user = await User.findOne({ 'profile.email': email });
    return !!user;
  }
}

module.exports = new UserRepository();
