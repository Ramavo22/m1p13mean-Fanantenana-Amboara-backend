const productTypeRepository = require('../modules/product-types/product-type.repository');

class ProductUtils {

  /* ===============================
     VALIDATION DES ATTRIBUTS
     =============================== */

  static async validateAttributes(typeProduitId, attributes = {}) {
    const productType = await productTypeRepository.findById(typeProduitId);
    if (!productType) {
      throw new Error('ProductType introuvable');
    }

    const typeAttributes = productType.attributes || [];

    for (const [code, value] of Object.entries(attributes)) {
      const attrDef = typeAttributes.find(a => a.code === code);

      if (!attrDef) {
        throw new Error(`Attribut non autorisé : ${code}`);
      }

      ProductUtils.validateAttributeValue(attrDef, value);
    }

    return true;
  }

  static validateAttributeValue(attrDef, value) {
    switch (attrDef.type) {
      case 'STRING':
        if (typeof value !== 'string') {
          throw new Error(`${attrDef.code} doit être une chaîne`);
        }
        break;

      case 'NUMBER':
        if (typeof value !== 'number') {
          throw new Error(`${attrDef.code} doit être un nombre`);
        }
        if (attrDef.min !== undefined && value < attrDef.min) {
          throw new Error(`${attrDef.code} doit être >= ${attrDef.min}`);
        }
        if (attrDef.max !== undefined && value > attrDef.max) {
          throw new Error(`${attrDef.code} doit être <= ${attrDef.max}`);
        }
        break;

      case 'BOOLEAN':
        if (typeof value !== 'boolean') {
          throw new Error(`${attrDef.code} doit être un booléen`);
        }
        break;

      case 'ENUM':
        if (!attrDef.values.includes(value)) {
          throw new Error(
            `${attrDef.code} doit être parmi : ${attrDef.values.join(', ')}`
          );
        }
        break;

      case 'DATE':
        if (isNaN(Date.parse(value))) {
          throw new Error(`${attrDef.code} doit être une date valide`);
        }
        break;

      default:
        throw new Error(`Type d’attribut inconnu : ${attrDef.type}`);
    }
  }
}

module.exports = ProductUtils;
