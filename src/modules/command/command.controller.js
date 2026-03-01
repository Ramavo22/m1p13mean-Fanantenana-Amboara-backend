const commandService = require('./command.service');

class CommandController {
  // POST /api/commands
  async create(req, res) {
    try {
      const command = await commandService.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Commande créée avec succès',
        data: command,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/commands
  async getAll(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const filter = {};
      if (req.query.boutiqueId) filter.boutiqueId = req.query.boutiqueId;
      if (req.query.acheteurId) filter.acheteurId = req.query.acheteurId;

      const result = await commandService.getAll(filter, page, limit);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/commands/:id
  async getById(req, res) {
    try {
      const command = await commandService.getById(req.params.id);
      return res.status(200).json({ success: true, data: command });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  // GET /api/commands/transaction/:transactionId
  async getByTransactionId(req, res) {
    try {
      const command = await commandService.getByTransactionId(req.params.transactionId);
      return res.status(200).json({ success: true, data: command });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  // GET /api/commands/my-commands — commandes de la boutique connectée
  async getMyCommands(req, res) {
    try {
      const userId = req.user.sub;
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const result = await commandService.getByBoutiqueUserId(userId, page, limit);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/commands/boutique/:boutiqueId
  async getByBoutique(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const result = await commandService.getByBoutique(req.params.boutiqueId, page, limit);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CommandController();
