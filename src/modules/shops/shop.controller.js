const shopService = require('./shop.service');

class ShopController {

  // PATCH /api/shops/assignate
  async assignateBoxToShop(req, res) {
    try {
      const assignationData = req.body;
      const { boxUpdated, isAssignate } = await shopService.assignateOrDesassignateBoxToShop(assignationData);

      return res.status(200).json({
        success: true,
        message: `La box "${boxUpdated.label}" a été ${isAssignate ? 'assignée' : 'désassignée'} avec succès`,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/shops
  async create(req, res) {
    try {
      if (!req.user || !req.user.sub) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifie',
        });
      }

      const shopPayload = {
        ...req.body,
        ownerUserId: req.user.sub,
      };

      const shop = await shopService.createShop(shopPayload);

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
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const result = await shopService.getAllShops(page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/shops/search
  async search(req, res) {
    try {
      const { status, ownerFullName } = req.query;
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const result = await shopService.searchShopsWithOwnerProfile({
        status,
        ownerFullName,
      }, page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
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

  // GET /api/shops/owner/:ownerUserId
  async getByOwnerUserId(req, res) {
    try {
      const { ownerUserId } = req.params;
      const shop = await shopService.getShopByOwnerUserId(ownerUserId);
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
