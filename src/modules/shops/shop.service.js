const shopRepository = require('./shop.repository');
const boxRepository = require('../boxes/box.repository');
const rentService = require('../rents/rent.service');
const BoxUtils = require('../boxes/box.utils');
const storageService = require('../storage/storage.services');

class ShopService {

  async createShop(data, photoFile = null) {
    // Exemple de validation métier
    if (!data.name) {
      throw new Error('Le nom de la boutique est obligatoire');
    }
    if (!data.ownerUserId) {
      throw new Error('Le ownerUserId est obligatoire');
    }

    // Gestion de la photo si fournie
    if (photoFile) {
      try {
        const photoData = await storageService.uploadImage(photoFile, storageService.shopBucket);
        data.photoUrl = photoData.publicUrl;
        data.photoPath = photoData.fileName;
      } catch (error) {
        throw new Error(`Erreur lors du traitement de la photo: ${error.message}`);
      }
    }

    return await shopRepository.create(data);
  }

  async getAllShops(page = 1, limit = 10) {
    return await shopRepository.findAll(page, limit);
  }

  async getShopsForSelect() {
    return await shopRepository.findShopForSelect();
  }

  async searchShopsWithOwnerProfile(filters, page = 1, limit = 10) {
    return await shopRepository.searchWithOwnerProfile(filters, page, limit);
  }

  async getShopById(id) {
    const shop = await shopRepository.findById(id);

    if (!shop) {
      throw new Error('Boutique introuvable');
    }

    return shop;
  }

  async getShopByOwnerUserId(ownerUserId) {
    const shops = await shopRepository.findByOwnerUserId(ownerUserId);
    // Retourne le premier shop trouvé avec box details ou null si aucun
    return shops[0] || null;
  }

  async updateShop(id, data, photoFile = null) {
    // Gestion de la photo si fournie
    if (photoFile) {
      try {
        const existingShop = await shopRepository.findById(id);
        // Supprimer l'ancienne photo si elle existe
        if (existingShop && existingShop.photoPath) {
          await storageService.deletePhoto(existingShop.photoPath, storageService.shopBucket);
        }
        // Enregistrer la nouvelle photo
        const photoData = await storageService.uploadImage(photoFile, storageService.shopBucket);
        data.photoUrl = photoData.publicUrl;
        data.photoPath = photoData.fileName;
      } catch (error) {
        throw new Error(`Erreur lors du traitement de la photo: ${error.message}`);
      }
    }

    const shop = await shopRepository.update(id, data);

    if (!shop) {
      throw new Error('Boutique introuvable');
    }

    return shop;
  }

  async deleteShop(id) {
    const shop = await shopRepository.findById(id);
    if (!shop) {
      throw new Error('Boutique introuvable');
    }

    // Supprimer la photo associée si elle existe
    if (shop.photoPath) {
      await storageService.deletePhoto(shop.photoPath, storageService.shopBucket);
    }

    const deletedShop = await shopRepository.delete(id);
    if (!deletedShop) {
      throw new Error('Boutique introuvable');
    }

    return deletedShop;
  }

  async assignateOrDesassignateBoxToShop(assignationInformation) {
    const box = await boxRepository.findById(assignationInformation.boxId);
    if (!box) {
      throw new Error("La box est introuvable");
    }

    const shop = await shopRepository.findById(assignationInformation.shopId);
    if (!shop) {
      throw new Error("La boutique est introuvable");
    }

    let rent = null;

    if (assignationInformation.isAssignate) {
      if (shop.boxId) {
        throw new Error("La boutique a déjà une box assignée");
      }

      if (!BoxUtils.validateStateChange(box.state, 'RENTED')) {
        throw new Error('Une box louée ne peut pas être assignée à une boutique');
      }

      shop.boxId = box._id;
      box.rent = assignationInformation.rent;
      box.state = 'RENTED';

      let rent = {
        boxId: box._id,
        shopId: shop._id,
        startDate: assignationInformation.startDate,
        amount: assignationInformation.rent,
        frequency: assignationInformation.frequency || 'MONTHLY'
      }
      rent = await rentService.createRent(rent);

    } else {
      if (!shop.boxId) {
        throw new Error("La boutique n'a pas de box assignée");
      }

      if (!BoxUtils.validateStateChange(box.state, 'AVAILABLE')) {
        throw new Error('Impossible de désassigner une box dans cet état');
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
      throw new Error('Aucune boutique trouvée pour cet utilisateur');
    }

    return shop;
  }

  /**
   * Met à jour uniquement la photo d'une boutique
   * @param {string} id - ID de la boutique
   * @param {Object} photoFile - Fichier photo
   * @returns {Object} - Boutique mise à jour
   */
  async updateShopPhoto(id, photoFile) {
    const existingShop = await this.getShopById(id);

    if (!photoFile) {
      throw new Error('Aucun fichier photo fourni');
    }

    try {
      // Supprimer l'ancienne photo si elle existe
      if (existingShop.photoPath) {
        await storageService.deletePhoto(existingShop.photoPath, storageService.shopBucket);
      }

      // Enregistrer la nouvelle photo
      const photoData = await storageService.uploadImage(photoFile, storageService.shopBucket);
      const updateData = { photoUrl: photoData.publicUrl, photoPath: photoData.fileName };

      const shop = await shopRepository.update(id, updateData);
      if (!shop) throw new Error('Boutique introuvable');

      return shop;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la photo: ${error.message}`);
    }
  }

  /**
   * Supprime la photo d'une boutique
   * @param {string} id - ID de la boutique
   * @returns {Object} - Boutique mise à jour
   */
  async removeShopPhoto(id) {
    const existingShop = await this.getShopById(id);

    // Supprimer le fichier photo si il existe
    if (existingShop.photoPath) {
      await storageService.deletePhoto(existingShop.photoPath, storageService.shopBucket);
    }

    const updateData = { photoUrl: null, photoPath: null };
    const shop = await shopRepository.update(id, updateData);

    if (!shop) throw new Error('Boutique introuvable');
    return shop;
  }
}

module.exports = new ShopService();
