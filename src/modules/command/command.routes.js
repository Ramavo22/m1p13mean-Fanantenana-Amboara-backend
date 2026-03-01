const express = require('express');
const router = express.Router();
const commandController = require('./command.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

// GET /api/commands/my-commands — commandes de la boutique connectée (avant /:id)
router.get('/my-commands', authenticateToken, (req, res) => commandController.getMyCommands(req, res));

// GET /api/commands/transaction/:transactionId — avant /:id
router.get('/transaction/:transactionId', authenticateToken, (req, res) => commandController.getByTransactionId(req, res));

// GET /api/commands/boutique/:boutiqueId — avant /:id
router.get('/boutique/:boutiqueId', authenticateToken, (req, res) => commandController.getByBoutique(req, res));

// GET /api/commands
router.get('/', authenticateToken, (req, res) => commandController.getAll(req, res));

// GET /api/commands/:id
router.get('/:id', authenticateToken, (req, res) => commandController.getById(req, res));

// POST /api/commands
router.post('/', authenticateToken, (req, res) => commandController.create(req, res));

module.exports = router;
