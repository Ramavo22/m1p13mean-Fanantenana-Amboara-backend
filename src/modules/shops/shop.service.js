const shopRepository = require('./shop.repository');

class ShopService {

  async createShop(data) {
    // Exemple de validation métier
    if (!data.name) {
      throw new Error('Le nom du shop est obligatoire');
    }
    if (!data.ownerUserId) {
      throw new Error('Le ownerUserId est obligatoire');
    }

    return await shopRepository.create(data);
  }

  async getAllShops() {
    return await shopRepository.findAll();
  }

  async getShopById(id) {
    const shop = await shopRepository.findById(id);

    if (!shop) {
      throw new Error('Shop introuvable');
    }

    return shop;
  }

  async getShopByOwnerUserId(ownerUserId) {
    const shop = await shopRepository.findByOwnerUserId(ownerUserId);

    // Retourne le premier shop trouvé ou null si aucun
    return shop[0] || null;
  }

  async updateShop(id, data) {
    const shop = await shopRepository.update(id, data);

    if (!shop) {
      throw new Error('Shop introuvable');
    }

    return shop;
  }

  async deleteShop(id) {
    const shop = await shopRepository.delete(id);

    if (!shop) {
      throw new Error('Shop introuvable');
    }

    return shop;
  }
}

module.exports = new ShopService();
