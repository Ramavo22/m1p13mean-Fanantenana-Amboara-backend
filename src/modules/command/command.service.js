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

  /**
   * Valide et construit le filtre à partir des query params bruts.
   * Lève une erreur si les dates sont invalides ou incohérentes.
   */
  buildAndValidateFilter(rawQuery = {}) {
    const filter = {};

    if (rawQuery.boutiqueId) filter.boutiqueId = rawQuery.boutiqueId;
    if (rawQuery.acheteurId) filter.acheteurId = rawQuery.acheteurId;

    if (rawQuery.startDate) {
      const start = new Date(rawQuery.startDate);
      if (isNaN(start.getTime())) throw new Error('startDate invalide');
      filter.startDate = rawQuery.startDate;
    }

    if (rawQuery.endDate) {
      const end = new Date(rawQuery.endDate);
      if (isNaN(end.getTime())) throw new Error('endDate invalide');
      filter.endDate = rawQuery.endDate;
    }

    if (filter.startDate && filter.endDate) {
      if (new Date(filter.startDate) >= new Date(filter.endDate)) {
        throw new Error('startDate doit être avant endDate');
      }
    }

    return filter;
  }

  async getAll(rawQuery = {}, page = 1, limit = 10) {
    const filter = this.buildAndValidateFilter(rawQuery);
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

  async getByBoutiqueUserId(userId, rawQuery = {}, page = 1, limit = 10) {
    const filter = this.buildAndValidateFilter(rawQuery);
    const shops = await shopRepository.findByOwnerUserId(userId);
    const shop = Array.isArray(shops) ? shops[0] : shops;
    if (!shop) throw new Error('Aucune boutique trouvée pour cet utilisateur');
    const boutiqueId = shop._id.toString();
    return commandRepository.findAll({ ...filter, boutiqueId }, page, limit);
  }
}

module.exports = new CommandService();
