const productTypeRepository = require('../product-types/product-type.repository');

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

  
  /**
     * Parse les données du produit envoyées par le frontend
     * @param {Object} body - Corps de la requête
     * @returns {Object} - Données du produit parsées
     */
    static parseProductData(body) {
      // Vérifier que body existe
      if (!body || typeof body !== 'object') {
        throw new Error('Données du produit manquantes ou invalides');
      }
  
      const productData = { ...body };
      
      // Parser les attributs s'ils sont envoyés en JSON stringifié
      if (productData.attributes && typeof productData.attributes === 'string') {
        try {
          productData.attributes = JSON.parse(productData.attributes);
        } catch (error) {
          console.warn('Erreur parsing attributs JSON:', error.message);
          productData.attributes = {};
        }
      }
      
      // Parser la promotion si elle est envoyée en JSON stringifié
      if (productData.promotion && typeof productData.promotion === 'string') {
        try {
          productData.promotion = JSON.parse(productData.promotion);
        } catch (error) {
          console.warn('Erreur parsing promotion JSON:', error.message);
          delete productData.promotion;
        }
      }
      
      // Convertir le prix en nombre si nécessaire
      if (productData.price && typeof productData.price === 'string') {
        productData.price = parseFloat(productData.price);
        if (isNaN(productData.price)) {
          throw new Error('Prix invalide');
        }
      }
      
      // Convertir le stock en nombre si nécessaire
      if (productData.stock && typeof productData.stock === 'string') {
        productData.stock = parseInt(productData.stock, 10);
        if (isNaN(productData.stock) || productData.stock < 0) {
          throw new Error('Stock invalide');
        }
      }
      
      // Valider les données obligatoires
      if (!productData.name || !productData.name.trim()) {
        throw new Error('Le nom du produit est obligatoire');
      }
      
      if (!productData.productTypeId || !productData.productTypeId.trim()) {
        throw new Error('Le type de produit est obligatoire');
      }
      
      if (productData.price === undefined || productData.price <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }
      
      return productData;
    }

}

module.exports = ProductUtils;
