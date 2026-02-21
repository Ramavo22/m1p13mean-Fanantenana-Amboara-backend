const shopRepository = require('./shop.repository');
const boxRepository = require('../boxes/box.repository');
const rentService = require('../rents/rent.service');
const BoxUtils = require('../boxes/box.utils');

class ShopService {

  async createShop(data) {
    // Exemple de validation métier
    if (!data.name) {
      throw new Error('Shop name is required');
    }
    if (!data.ownerUserId) {
      throw new Error('The ownerUserId is required');
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
      throw new Error('Shop not found');
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
      throw new Error('Shop not found');
    }

    return shop;
  }

  async deleteShop(id) {
    const shop = await shopRepository.delete(id);

    if (!shop) {
      throw new Error('Shop not found');
    }

    return shop;
  }

  async assignateOrDesassignateBoxToShop(assignationInformation) {
    const box = await boxRepository.findById(assignationInformation.boxId);
    if (!box) {
      throw new Error("The box was not found");
    }

    const shop = await shopRepository.findById(assignationInformation.shopId);
    if (!shop) {
      throw new Error("The shop was not found");
    }

    let rent = null;

    if (assignationInformation.isAssignate) {
      if (shop.boxId) {
        throw new Error("The shop already has an assigned box");
      }

      if (!BoxUtils.validateStateChange(box.state, 'RENTED')) {
        throw new Error('A rented box cannot be assigned to a shop');
      }

      shop.boxId = box._id;
      box.rent = assignationInformation.rent;
      box.state = 'RENTED';

      let rent = {
        boxId: box._id,
        shopId: shop._id,
        startDate: new Date(),
        amount: assignationInformation.rent,
        frequency: assignationInformation.frequency || 'MONTHLY'
      }
      rent = await rentService.createRent(rent);

    } else {
      if (!shop.boxId) {
        throw new Error("The shop does not have an assigned box");
      }

      if (!BoxUtils.validateStateChange(box.state, 'AVAILABLE')) {
        throw new Error('Impossible to unassign a box in this state');
      }

      shop.boxId = null;
      box.state = 'AVAILABLE';
    }

    const shopUpdated = await shopRepository.update(shop._id, shop);
    const boxUpdated = await boxRepository.update(box._id, box);
    const isAssignate = assignationInformation.isAssignate;
    return { boxUpdated, shopUpdated, isAssignate, rent };
  }
}

module.exports = new ShopService();
