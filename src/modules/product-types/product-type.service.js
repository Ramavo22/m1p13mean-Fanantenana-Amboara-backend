const productTypeRepository = require('./product-type.repository');
const { generateProductTypeId } = require('../../utils/utils.generator');

class ProductTypeService {

  async createProductType(data) {
    // Génération automatique et obligatoire de l'ID
    // On supprime tout _id fourni manuellement
    delete data._id;
    data._id = await generateProductTypeId();

    if (!data.label) {
      throw new Error('Le libellé du type de produit est obligatoire');
    }

    // Validation métier complémentaire
    if (data.attributes?.length) {
      data.attributes.forEach(attr => {
        if (!attr.code || !attr.type) {
          throw new Error('Chaque attribut doit avoir un code et un type');
        }

        if (attr.type === 'ENUM' && (!attr.values || attr.values.length === 0)) {
          throw new Error(`L'attribut ${attr.code} doit avoir des valeurs`);
        }

        if (attr.type === 'NUMBER') {
          if (attr.min === undefined || attr.max === undefined) {
            throw new Error(`L'attribut ${attr.code} doit avoir un min et un max`);
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
      throw new Error('Type de produit introuvable');
    }

    return productType;
  }

  async updateProductType(id, data) {
    const productType = await productTypeRepository.update(id, data);

    if (!productType) {
      throw new Error('Type de produit introuvable');
    }

    return productType;
  }

  async deleteProductType(id) {
    const productType = await productTypeRepository.delete(id);

    if (!productType) {
      throw new Error('Type de produit introuvable');
    }

    return productType;
  }

  async getProductTypesForSelect() {
    return await productTypeRepository.findProductTypeForSelect();
  }

}

module.exports = new ProductTypeService();
