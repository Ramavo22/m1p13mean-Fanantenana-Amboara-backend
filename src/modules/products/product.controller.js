const productService = require('./product.service');

class ProductController {

  // POST /api/products
  async create(req, res) {
    try {
      const product = await productService.createProduct(req.body);

      return res.status(201).json({
        success: true,
        message: 'Produit créé avec succès',
        data: product
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/products
  async getFiltered(req, res) {
    try {
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
        if (!['shopIds','typeProduitIds','priceMin','priceMax','inStock'].includes(key)) {
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

      const products = await productService.getProductsFiltered(filter);

      res.status(200).json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
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
      const product = await productService.updateProduct(id, req.body);

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

}

module.exports = new ProductController();
