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

      const activeRent = await rentService.getActiveRentByBoxAndShop(box._id, shop._id);
      if (activeRent) {
        await rentService.updateRent(activeRent._id, { status: 'CANCELLED' });
      }

      shop.boxId = null;
      box.state = 'AVAILABLE';
      box.rent = 0;
    }

    const shopUpdated = await shopRepository.update(shop._id, shop);
    const boxUpdated = await boxRepository.update(box._id, box);
    const isAssignate = assignationInformation.isAssignate;
    return { boxUpdated, shopUpdated, isAssignate, rent };
  }

  /**
   * Récupère uniquement l'id et le nom de la boutique d'un utilisateur connecté
   * @param {string} userId - ID de l'utilisateur (req.user.sub)
   * @returns {Promise<{_id: string, name: string} | null>}
   */
  async getUserShopInfo(userId) {
    const shop = await shopRepository.findShopByUserId(userId);
    
    if (!shop) {
      throw new Error('No shop found for this user');
    }

    return shop;
  }
}

module.exports = new ShopService();
