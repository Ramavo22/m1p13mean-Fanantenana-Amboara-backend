const panierService = require('./panier.service');

class PanierController {

  // GET /api/paniers
  async getAll(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const result = await panierService.getAll(page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/paniers/my-paniers — paniers de l'utilisateur connecté
  async getMyPaniers(req, res) {
    try {
      const acheteurId = req.user.sub;
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const result = await panierService.getMyPaniers(acheteurId, page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/paniers/my-pending — panier PENDING de l'utilisateur connecté
  async getMyPendingPanier(req, res) {
    try {
      const acheteurId = req.user.sub;
      const panier = await panierService.getMyPendingPanier(acheteurId);
      return res.status(200).json({ success: true, data: panier });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/paniers/transaction/:transactionId
  async getByTransactionId(req, res) {
    try {
      const { transactionId } = req.params;
      const panier = await panierService.getPanierByTransactionId(transactionId);
      return res.status(200).json({ success: true, data: panier });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  // GET /api/paniers/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const panier = await panierService.getById(id);

      return res.status(200).json({ success: true, data: panier });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  // POST /api/paniers
  async create(req, res) {
    try {
      const acheteurId = req.user.sub;
      const { items, etat } = req.body;

      const panier = await panierService.create(acheteurId, items, etat);

      return res.status(201).json({
        success: true,
        message: 'Panier créé avec succès',
        data: panier,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // PUT /api/paniers/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const panier = await panierService.update(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Panier mis à jour avec succès',
        data: panier,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/paniers/:id/validate
  async validate(req, res) {
    try {
      const { id } = req.params;
      const panier = await panierService.validate(id);

      return res.status(200).json({
        success: true,
        message: 'Panier validé avec succès',
        data: panier,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/paniers/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      await panierService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Panier supprimé avec succès',
      });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PanierController();
