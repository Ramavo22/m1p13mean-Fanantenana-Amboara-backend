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
      const result = await commandService.getAll(req.query, page, limit);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      const status = error.message.includes('invalide') || error.message.includes('avant') ? 400 : 500;
      return res.status(status).json({ success: false, message: error.message });
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
      const result = await commandService.getByBoutiqueUserId(userId, req.query, page, limit);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      const status = error.message.includes('invalide') || error.message.includes('avant') ? 400 : 500;
      return res.status(status).json({ success: false, message: error.message });
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
