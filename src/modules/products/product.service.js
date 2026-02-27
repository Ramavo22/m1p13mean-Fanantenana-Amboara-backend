const productRepository = require('./product.repository');
const ProductUtils = require('./product.utils');
const shopRepository = require('../shops/shop.repository');
const { generateProductId } = require('../../utils/utils.generator');
const StockMovement = require('../mvt-stock/stockMovement.model');
const MvtStockService = require('../mvt-stock/mvtStock.service');
const storageService = require('../storage/storage.services');

class ProductService {

  async createProduct(data, userId, photoFile = null) {
    // Génération automatique et obligatoire de l'ID
    // On supprime tout _id fourni manuellement
    delete data._id;
    data._id = await generateProductId();

    if (!data.name) throw new Error('Le nom du produit est obligatoire');
    if (!data.productTypeId) throw new Error('typeProduitId est obligatoire');

    // Récupération automatique de la boutique de l'utilisateur connecté
    const shop = await shopRepository.findShopByUserId(userId);
    if (!shop) {
      throw new Error('Aucune boutique trouvée pour cet utilisateur');
    }
    data.shop = shop;

    // Gestion de la photo si fournie
    if (photoFile) {
      try {
        const photoData = await storageService.uploadImage(photoFile);
        data.photoUrl = photoData.publicUrl;
        data.photoPath = photoData.fileName;
      } catch (error) {
        throw new Error(`Erreur lors du traitement de la photo: ${error.message}`);
      }
    }

    // Validation des attributs selon ProductType
    await ProductUtils.validateAttributes(data.productTypeId, data.attributes);

    return await productRepository.create(data);
  }

  async getAllProducts(filter = {}) {
    return await productRepository.findAll(filter);
  }

  /**
   * Récupère les produits de la boutique liée à l'utilisateur connecté
   * @param {string} userId - ID de l'utilisateur connecté
   * @param {number} page
   * @param {number} limit
   */
  async getProductsForUserShop(userId, page = 1, limit = 10) {
    // Récupération automatique de la boutique de l'utilisateur connecté
    const shop = await shopRepository.findShopByUserId(userId);
    if (!shop) {
      throw new Error('Aucune boutique trouvée pour cet utilisateur');
    }

    // Utiliser le repository existant pour appliquer la pagination et les filtres
    return await productRepository.findFiltered({ shopIds: [shop._id] }, page, limit);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Produit introuvable');
    return product;
  }

  async updateProduct(id, data, photoFile = null) {
    const existingProduct = await this.getProductById(id);

    const productTypeId = existingProduct.productTypeId;
    const attributes = data.attributes || existingProduct.attributes;
    const boutique = data.boutique || existingProduct.boutique;

    // Gestion de la photo si fournie
    if (photoFile) {
      try {
        // Supprimer l'ancienne photo si elle existe
        if (existingProduct.photoUrl) {
          await storageService.deletePhoto(existingProduct.photoPath);
        }
        
        // Enregistrer la nouvelle photo
        const photoData = await storageService.uploadImage(photoFile);
        data.photoUrl = photoData.publicUrl;
        data.photoPath = photoData.fileName;
      } catch (error) {
        throw new Error(`Erreur lors du traitement de la photo: ${error.message}`);
      }
    }

    // Validation attributs
    await ProductUtils.validateAttributes(productTypeId, attributes);

    const product = await productRepository.update(id, data);
    if (!product) throw new Error('Produit introuvable');

    return product;
  }

  async deleteProduct(id) {
    const product = await this.getProductById(id);
    
    // Supprimer la photo associée si elle existe
    if (product.photoUrl) {
      await storageService.deletePhoto(product.photoPath);
    }
    
    const deletedProduct = await productRepository.delete(id);
    if (!deletedProduct) throw new Error('Produit introuvable');
    
    return deletedProduct;
  }

  async getProductsFiltered(filter, page = 1, limit = 10) {
    return await productRepository.findFiltered(filter, page, limit);
  }

  async getAllProductsPaginated(filter = {}, page = 1, limit = 10) {
    return await productRepository.findAllPaginated(filter, page, limit);
  }

  async addStock(productId, quantity, reason = 'ACHAT') {
    if (quantity <= 0) {
      throw new Error('La quantité ajoutée doit être supérieure à zéro');
    }

    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error('Produit introuvable');
    }

    product.stock += quantity;
    await product.save();

    // Log stock movement using MvtStockService
    await MvtStockService.createMovement({
      _id: `STK${Date.now()}`,
      produitId: productId,
      qte: quantity,
      reason,
      updatedAt: new Date()
    });

    return product;
  }

  /**
   * Met à jour uniquement la photo d'un produit
   * @param {string} id - ID du produit
   * @param {Object} photoFile - Fichier photo
   * @returns {Object} - Produit mis à jour
   */
  async updateProductPhoto(id, photoFile) {
    const existingProduct = await this.getProductById(id);
    
    if (!photoFile) {
      throw new Error('Aucun fichier photo fourni');
    }

    try {
      // Supprimer l'ancienne photo si elle existe
      if (existingProduct.photoUrl) {
        await storageService.deletePhoto(existingProduct.photoPath);
      }
      
      // Enregistrer la nouvelle photo
      const photoData = await storageService.uploadImage(photoFile);
      const updateData = { photoUrl: photoData.publicUrl,photoPath:photoData.fileName  };
      
      const product = await productRepository.update(id, updateData);
      if (!product) throw new Error('Produit introuvable');

      return product;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la photo: ${error.message}`);
    }
  }

  /**
   * Supprime la photo d'un produit
   * @param {string} id - ID du produit
   * @returns {Object} - Produit mis à jour
   */
  async removeProductPhoto(id) {
    const existingProduct = await this.getProductById(id);
    
    // Supprimer le fichier photo si il existe
    if (existingProduct.photoUrl) {
      await storageService.deletePhoto(existingProduct.photoPath);
    }
    
    const updateData = { photoUrl: null,photoPath: null };
    const product = await productRepository.update(id, updateData);
    
    if (!product) throw new Error('Produit introuvable');
    return product;
  }

}

module.exports = new ProductService();
