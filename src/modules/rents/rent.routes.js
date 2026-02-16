const express = require('express');
const router = express.Router();
const rentController = require('./rent.controller');
const { authenticateToken , authorizeRoles } = require('../../middleware/auth.middleware');

router.post('/', authenticateToken, authorizeRoles('ADMIN'), (req, res) => rentController.create(req, res));
router.get('/', authenticateToken, authorizeRoles('ADMIN','BOUTIQUE'), (req, res) => rentController.getAllRents(req, res));
router.get('/:id', authenticateToken, authorizeRoles('ADMIN','BOUTIQUE'), (req, res) => rentController.getRentById(req, res));
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), (req, res) => rentController.deleteRent(req, res));
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), (req, res) => rentController.updateRent(req, res));

module.exports = router;