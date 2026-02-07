const shopService = require('./shop.service');

class ShopController {

  // POST /api/shops
  async create(req, res) {
    try {
      const shop = await shopService.createShop(req.body);

      return res.status(201).json({
        success: true,
        message: 'Shop créé avec succès',
        data: shop,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/shops
  async getAll(req, res) {
    try {
      const shops = await shopService.getAllShops();

      return res.status(200).json({
        success: true,
        data: shops,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/shops/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const shop = await shopService.getShopById(id);

      return res.status(200).json({
        success: true,
        data: shop,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/shops/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const shop = await shopService.updateShop(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Shop mis à jour avec succès',
        data: shop,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /api/shops/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      await shopService.deleteShop(id);

      return res.status(200).json({
        success: true,
        message: 'Shop supprimé avec succès',
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ShopController();
