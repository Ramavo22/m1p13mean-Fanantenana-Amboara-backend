const productTypeRepository = require('./product-type.repository');
const { generateProductTypeId } = require('../../utils/utils.generator');

class ProductTypeService {

  async createProductType(data) {
    // Génération automatique et obligatoire de l'ID
    // On supprime tout _id fourni manuellement
    delete data._id;
    data._id = await generateProductTypeId();

    if (!data.label) {
      throw new Error('The product type label is required');
    }

    // Validation métier complémentaire
    if (data.attributes?.length) {
      data.attributes.forEach(attr => {
        if (!attr.code || !attr.type) {
          throw new Error('Each attribute must have a code and a type');
        }

        if (attr.type === 'ENUM' && (!attr.values || attr.values.length === 0)) {
          throw new Error(`The attribute ${attr.code} must have values`);
        }

        if (attr.type === 'NUMBER') {
          if (attr.min === undefined || attr.max === undefined) {
            throw new Error(`The attribute ${attr.code} must have min and max`);
          }
          if (attr.min > attr.max) {
            throw new Error(`min cannot be greater than max for ${attr.code}`);
          }
        }
      });
    }

    return await productTypeRepository.create(data);
  }

  async getAllProductTypes(page = 1, limit = 10) {
    return await productTypeRepository.findAll(page, limit);
  }

  async getProductTypeById(id) {
    const productType = await productTypeRepository.findById(id);

    if (!productType) {
      throw new Error('Product type not found');
    }

    return productType;
  }

  async updateProductType(id, data) {
    const productType = await productTypeRepository.update(id, data);

    if (!productType) {
      throw new Error('Product type not found');
    }

    return productType;
  }

  async deleteProductType(id) {
    const productType = await productTypeRepository.delete(id);

    if (!productType) {
      throw new Error('Product type not found');
    }

    return productType;
  }

  async getProductTypesForSelect() {
    return await productTypeRepository.findProductTypeForSelect();
  }

}

module.exports = new ProductTypeService();
