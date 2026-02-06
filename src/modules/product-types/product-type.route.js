const express = require('express');
const router = express.Router();
const productTypeController = require('./product-type.controller');

router.post('/', (req, res) => productTypeController.create(req, res));
router.get('/', (req, res) => productTypeController.getAll(req, res));
router.get('/:id', (req, res) => productTypeController.getById(req, res));
router.put('/:id', (req, res) => productTypeController.update(req, res));
router.delete('/:id', (req, res) => productTypeController.delete(req, res));

module.exports = router;
