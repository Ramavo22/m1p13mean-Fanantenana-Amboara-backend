const mvtStockRepository = require('./mvtStock.repository');

class MvtStockService {
  async createMovement(data) {
    if (!data.produitId || !data.qte || !data.reason) {
      throw new Error('Produit ID, quantité, et raison sont obligatoires');
    }

    return await mvtStockRepository.create(data);
  }

  async getMovements(filter = {}, page = 1, limit = 10) {
    return await mvtStockRepository.findAll(filter, page, limit);
  }
}

module.exports = new MvtStockService();