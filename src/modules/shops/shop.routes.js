const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');

router.post('/', (req, res) => shopController.create(req, res));
router.get('/', (req, res) => shopController.getAll(req, res));
router.get('/:id', (req, res) => shopController.getById(req, res));
router.put('/:id', (req, res) => shopController.update(req, res));
router.delete('/:id', (req, res) => shopController.delete(req, res));

module.exports = router;
