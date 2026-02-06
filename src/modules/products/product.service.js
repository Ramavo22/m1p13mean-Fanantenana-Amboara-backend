const productRepository = require('./product.repository');
const ProductUtils = require('../../utils/product.utils');
const shopRepository = require('../shops/shop.repository');

class ProductService {

  async createProduct(data) {
    if (!data._id) throw new Error('L’identifiant du produit est obligatoire');
    if (!data.name) throw new Error('Le nom du produit est obligatoire');
    if (!data.productTypeId) throw new Error('typeProduitId est obligatoire');
    if (!data.shop) throw new Error('La boutique est obligatoire');

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

  async getProductsFiltered(filter) {
    return await productRepository.findFiltered(filter);
  }


}

module.exports = new ProductService();
