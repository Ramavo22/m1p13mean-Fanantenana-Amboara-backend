const productService = require('./product.service');
const multer = require('multer');
const ProductUtils = require('./product.utils');

class ProductController {

  // POST /api/products
  async create(req, res) {
    try {
      const userId = req.user.sub; 
      const photoFile = req.file
      // Parser les données du frontend
      const productData = ProductUtils.parseProductData(req.body);
      const product = await productService.createProduct(productData, userId, photoFile);

      return res.status(201).json({
        success: true,
        message: 'Produit créé avec succès',
        data: product
      });
    } catch (error) {
      console.error('Erreur création produit:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/products
  async getFiltered(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

      // Construire le filtre à partir des query params
      const filter = {};

      if (req.query.shopIds) {
        filter.shopIds = req.query.shopIds.split(','); // array
      }

      if (req.query.typeProduitIds) {
        filter.typeProduitIds = req.query.typeProduitIds.split(',');
      }

      if (req.query.priceMin) filter.priceMin = parseFloat(req.query.priceMin);
      if (req.query.priceMax) filter.priceMax = parseFloat(req.query.priceMax);

      if (req.query.inStock) filter.inStock = req.query.inStock === 'true';

      // Attributs dynamiques (ex: SIZE, SMART)
      const attributes = {};
      for (const key in req.query) {
        if (!['shopIds','typeProduitIds','priceMin','priceMax','inStock','page','limit'].includes(key)) {
          let value = req.query[key];
          // Convertir "true"/"false" en booléen si applicable
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          attributes[key] = value;
        }
      }
      if (Object.keys(attributes).length > 0) {
        filter.attributes = attributes;
      }

      const result = await productService.getProductsFiltered(filter, page, limit);

      res.status(200).json({ 
        success: true, 
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/products/my-product - produits de la boutique de l'utilisateur connecté
  async myProducts(req, res) {
    try {
      const userId = req.user.sub;
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

      const result = await productService.getProductsForUserShop(userId, page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/products/paginated - Version paginée avec product type et shop en tant que noms
  async getAllPaginated(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

      // Construire le filtre à partir des query params
      const filter = {};

      if (req.query.shopIds) {
        filter.shopIds = req.query.shopIds.split(',');
      }

      if (req.query.typeProduitIds) {
        filter.typeProduitIds = req.query.typeProduitIds.split(',');
      }

      if (req.query.priceMin) filter.priceMin = parseFloat(req.query.priceMin);
      if (req.query.priceMax) filter.priceMax = parseFloat(req.query.priceMax);

      if (req.query.inStock) filter.inStock = req.query.inStock === 'true';

      // Attributs dynamiques
      const attributes = {};
      for (const key in req.query) {
        if (!['shopIds','typeProduitIds','priceMin','priceMax','inStock','page','limit'].includes(key)) {
          let value = req.query[key];
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          attributes[key] = value;
        }
      }
      if (Object.keys(attributes).length > 0) {
        filter.attributes = attributes;
      }

      const result = await productService.getAllProductsPaginated(filter, page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/products/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/products/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const photoFile = req.file; // Fichier photo depuis multer
      
      // Parser les données du frontend
      const productData = ProductUtils.parseProductData(req.body);
      
      const product = await productService.updateProduct(id, productData, photoFile);

      return res.status(200).json({
        success: true,
        message: 'Produit mis à jour avec succès',
        data: product
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/products/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      return res.status(200).json({
        success: true,
        message: 'Produit supprimé avec succès'
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/products/:id/add-stock
  async addStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, reason = 'ACHAT' } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Quantité invalide' });
      }

      const updatedProduct = await productService.addStock(id, quantity, reason);
      res.status(200).json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/products/:id/photo - Mettre à jour uniquement la photo
  async updatePhoto(req, res) {
    try {
      const { id } = req.params;
      const photoFile = req.file;

      if (!photoFile) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier photo fourni'
        });
      }

      const product = await productService.updateProductPhoto(id, photoFile);

      return res.status(200).json({
        success: true,
        message: 'Photo du produit mise à jour avec succès',
        data: product
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/products/:id/photo - Supprimer la photo
  async removePhoto(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.removeProductPhoto(id);

      return res.status(200).json({
        success: true,
        message: 'Photo du produit supprimée avec succès',
        data: product
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

}

// Export du contrôleur avec le middleware multer
const controller = new ProductController();
module.exports = controller;
