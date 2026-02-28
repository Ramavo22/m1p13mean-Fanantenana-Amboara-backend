const commandRepository = require('./command.repository');
const { generateSequentialId } = require('../../utils/utils.generator');
const shopRepository = require('../shops/shop.repository');

class CommandService {
  async create(data) {
    const { acheteur, boutique, transactionId, items } = data;

    if (!acheteur?._id || !acheteur?.name) throw new Error('Informations acheteur invalides');
    if (!boutique?._id || !boutique?.name) throw new Error('Informations boutique invalides');
    if (!transactionId) throw new Error('transactionId est requis');
    if (!items?.length) throw new Error('La commande doit contenir au moins un article');

    const totalItems = items.length;
    const totalAmount = items.reduce((sum, item) => sum + item.produit.price * item.produit.qte, 0);
    const _id = await generateSequentialId('CMD');

    return commandRepository.create({
      _id,
      acheteur,
      boutique,
      transactionId,
      items,
      totalAmount,
      totalItems,
    });
  }

  async getAll(filter = {}, page = 1, limit = 10) {
    return commandRepository.findAll(filter, page, limit);
  }

  async getById(id) {
    const command = await commandRepository.findById(id);
    if (!command) throw new Error('Commande introuvable');
    return command;
  }

  async getByTransactionId(transactionId) {
    const command = await commandRepository.findByTransactionId(transactionId);
    if (!command) throw new Error('Commande introuvable pour cette transaction');
    return command;
  }



  async getByBoutique(boutiqueId, page = 1, limit = 10) {
    return commandRepository.findByBoutique(boutiqueId, page, limit);
  }

  async getByBoutiqueUserId(userId, page = 1, limit = 10) {
    const shops = await shopRepository.findByOwnerUserId(userId);
    const shop = Array.isArray(shops) ? shops[0] : shops;
    if (!shop) throw new Error('Aucune boutique trouvée pour cet utilisateur');
    const boutiqueId = shop._id.toString();
    return commandRepository.findByBoutique(boutiqueId, page, limit);
  }
}

module.exports = new CommandService();
