const productTypeRepository = require('./product-type.repository');

class ProductTypeService {

  async createProductType(data) {
    if (!data._id) {
      throw new Error('L’identifiant du product type est obligatoire');
    }

    if (!data.label) {
      throw new Error('Le label du product type est obligatoire');
    }

    // Validation métier complémentaire
    if (data.attributes?.length) {
      data.attributes.forEach(attr => {
        if (!attr.code || !attr.type) {
          throw new Error('Chaque attribut doit avoir un code et un type');
        }

        if (attr.type === 'ENUM' && (!attr.values || attr.values.length === 0)) {
          throw new Error(`L’attribut ${attr.code} doit avoir des values`);
        }

        if (attr.type === 'NUMBER') {
          if (attr.min === undefined || attr.max === undefined) {
            throw new Error(`L’attribut ${attr.code} doit avoir min et max`);
          }
          if (attr.min > attr.max) {
            throw new Error(`min ne peut pas être supérieur à max pour ${attr.code}`);
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
      throw new Error('Product type introuvable');
    }

    return productType;
  }

  async updateProductType(id, data) {
    const productType = await productTypeRepository.update(id, data);

    if (!productType) {
      throw new Error('Product type introuvable');
    }

    return productType;
  }

  async deleteProductType(id) {
    const productType = await productTypeRepository.delete(id);

    if (!productType) {
      throw new Error('Product type introuvable');
    }

    return productType;
  }

}

module.exports = new ProductTypeService();
