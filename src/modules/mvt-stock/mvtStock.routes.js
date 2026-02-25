const express = require('express');
const router = express.Router();
const mvtStockService = require('./mvtStock.service');

// Route to create a stock movement
router.post('/', async (req, res) => {
  try {
    const movement = await mvtStockService.createMovement(req.body);
    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get paginated and filtered stock movements
router.get('/', async (req, res) => {
  try {
    const { produitId, reason, page, limit } = req.query;
    const filter = { produitId, reason };
    const movements = await mvtStockService.getMovements(filter, parseInt(page) || 1, parseInt(limit) || 10);
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;