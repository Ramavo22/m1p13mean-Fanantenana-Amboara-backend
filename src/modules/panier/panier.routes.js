const express = require('express');
const router = express.Router();
const panierController = require('./panier.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Paniers
 *   description: Gestion des paniers d'achat
 */

// GET /api/paniers/my-paniers  — doit être avant /:id
router.get('/my-paniers', authenticateToken, (req, res) => panierController.getMyPaniers(req, res));

// GET /api/paniers/my-pending  — panier PENDING de l'utilisateur connecté
router.get('/my-pending', authenticateToken, (req, res) => panierController.getMyPendingPanier(req, res));

// GET /api/paniers/transaction/:transactionId — panier lié à une transaction
router.get('/transaction/:transactionId', authenticateToken, (req, res) => panierController.getByTransactionId(req, res));

// GET /api/paniers
router.get('/', authenticateToken, (req, res) => panierController.getAll(req, res));

// GET /api/paniers/:id
router.get('/:id', authenticateToken, (req, res) => panierController.getById(req, res));

// POST /api/paniers
router.post('/', authenticateToken, (req, res) => panierController.create(req, res));

// PUT /api/paniers/:id
router.put('/:id', authenticateToken, (req, res) => panierController.update(req, res));

// PATCH /api/paniers/:id/validate
router.patch('/:id/validate', authenticateToken, (req, res) => panierController.validate(req, res));

// DELETE /api/paniers/:id
router.delete('/:id', authenticateToken, (req, res) => panierController.delete(req, res));

module.exports = router;
