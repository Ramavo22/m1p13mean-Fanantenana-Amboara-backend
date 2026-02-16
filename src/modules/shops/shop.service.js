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

  async assignateOrDesassignateBoxToShop(assignationInformation) {
    const box = await boxRepository.findById(assignationInformation.boxId);
    if (!box) {
      throw new Error("La box n'est pas trouvée");
    }

    let shop = null;

    if (assignationInformation.isAssignate) {
      if (!assignationInformation.shopId) {
        throw new Error("Le shopId est obligatoire pour l'assignation");
      }

      if (box.shopId) {
        throw new Error("La box est déjà assignée");
      }

      if (!BoxUtils.validateStateChange(box.state, 'RENTED')) {
        throw new Error('Impossible d’assigner une box dans cet état');
      }

      shop = await shopRepository.findById(assignationInformation.shopId);
      if (!shop) {
        throw new Error("Le shop n'est pas trouvé");
      }

      box.shopId = shop._id;
      box.state = 'RENTED';
    } else {
      if (!box.shopId) {
        throw new Error("La box n'est pas assignée");
      }

      if (!BoxUtils.validateStateChange(box.state, 'AVAILABLE')) {
        throw new Error('Impossible de désassigner une box dans cet état');
      }

      box.shopId = null;
      box.state = 'AVAILABLE';
    }

    const boxUpdated = await boxRepository.update(box._id, box);
    const isAssignate = assignationInformation.isAssignate;
    return { boxUpdated, isAssignate };
  }

}

module.exports = new ShopService();
