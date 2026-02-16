const shopRepository = require('./shop.repository');
const boxRepository = require('../boxes/box.repository');
const BoxUtils = require('../boxes/box.utils');

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

  async getAllShops(page = 1, limit = 10) {
    return await shopRepository.findAll(page, limit);
  }

  async searchShopsWithOwnerProfile(filters, page = 1, limit = 10) {
    return await shopRepository.searchWithOwnerProfile(filters, page, limit);
  }

  async getShopById(id) {
    const shop = await shopRepository.findById(id);

    if (!shop) {
      throw new Error('Shop introuvable');
    }

    return shop;
  }

  async getShopByOwnerUserId(ownerUserId) {
    const shops = await shopRepository.findByOwnerUserId(ownerUserId);
    // Retourne le premier shop trouvé avec box details ou null si aucun
    return shops[0] || null;
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

  async assignateOrDesassignateBoxToShop(assignationInformation) {
    const box = await boxRepository.findById(assignationInformation.boxId);
    if (!box) {
      throw new Error("La box n'est pas trouvee");
    }

    if (!assignationInformation.shopId) {
      throw new Error("Le shopId est obligatoire");
    }

    const shop = await shopRepository.findById(assignationInformation.shopId);
    if (!shop) {
      throw new Error("Le shop n'est pas trouve");
    }

    if (assignationInformation.isAssignate) {
      if (shop.boxId) {
        throw new Error("Le shop a deja une box assignee");
      }

      if (!BoxUtils.validateStateChange(box.state, 'RENTED')) {
        throw new Error('Impossible d\'assigner une box dans cet etat');
      }

      shop.boxId = box._id;
      box.shopId = shop._id;
      box.state = 'RENTED';
    } else {
      if (!shop.boxId) {
        throw new Error("Le shop n'a pas de box assignee");
      }

      if (!BoxUtils.validateStateChange(box.state, 'AVAILABLE')) {
        throw new Error('Impossible de desassigner une box dans cet etat');
      }

      shop.boxId = null;
      box.shopId = null;
      box.state = 'AVAILABLE';
    }

    const shopUpdated = await shopRepository.update(shop._id, shop);
    const boxUpdated = await boxRepository.update(box._id, box);
    const isAssignate = assignationInformation.isAssignate;
    return { boxUpdated, shopUpdated, isAssignate };
  }

}

module.exports = new ShopService();
