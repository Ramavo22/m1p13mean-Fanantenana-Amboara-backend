const productTypeService = require('./product-type.service');

class ProductTypeController {

  // POST /api/product-types
  async create(req, res) {
    try {
      const productType = await productTypeService.createProductType(req.body);

      return res.status(201).json({
        success: true,
        message: 'Product type créé avec succès',
        data: productType,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/product-types
  async getAll(req, res) {
    try {
      const productTypes = await productTypeService.getAllProductTypes();

      return res.status(200).json({
        success: true,
        data: productTypes,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/product-types/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const productType = await productTypeService.getProductTypeById(id);

      return res.status(200).json({
        success: true,
        data: productType,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/product-types/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const productType = await productTypeService.updateProductType(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Product type mis à jour avec succès',
        data: productType,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /api/product-types/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      await productTypeService.deleteProductType(id);

      return res.status(200).json({
        success: true,
        message: 'Product type supprimé avec succès',
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

}

module.exports = new ProductTypeController();
