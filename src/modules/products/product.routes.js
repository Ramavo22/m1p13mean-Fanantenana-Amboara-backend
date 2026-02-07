const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

// CRUD produits
router.post('/', (req, res) => productController.create(req, res));
router.get('/', (req, res) => productController.getFiltered(req, res));
router.get('/:id', (req, res) => productController.getById(req, res));
router.put('/:id', (req, res) => productController.update(req, res));
router.delete('/:id', (req, res) => productController.delete(req, res));

module.exports = router;
