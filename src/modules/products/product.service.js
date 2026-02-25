const productRepository = require('./product.repository');
const ProductUtils = require('./product.utils');
const shopRepository = require('../shops/shop.repository');
const { generateProductId } = require('../../utils/utils.generator');
const StockMovement = require('../mvt-stock/stockMovement.model');
const MvtStockService = require('../mvt-stock/mvtStock.service');

class ProductService {

  

  async createProduct(data, userId) {
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

    // Validation des attributs selon ProductType
    await ProductUtils.validateAttributes(data.productTypeId, data.attributes);

    return await productRepository.create(data);
  }

  async getAllProducts(filter = {}) {
    return await productRepository.findAll(filter);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Produit introuvable');
    return product;
  }

  async updateProduct(id, data) {
    const existingProduct = await this.getProductById(id);

    const typeProduitId = data.typeProduitId || existingProduct.typeProduitId;
    const attributes = data.attributes || existingProduct.attributes;
    const boutique = data.boutique || existingProduct.boutique;

    // Validation attributs
    await ProductUtils.validateAttributes(typeProduitId, attributes);

    const product = await productRepository.update(id, data);
    if (!product) throw new Error('Produit introuvable');

    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.delete(id);
    if (!product) throw new Error('Produit introuvable');
    return product;
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

}

module.exports = new ProductService();
