const express = require('express');
const router = express.Router();
const boxController = require('./box.controller');

router.post('/', (req, res) => boxController.create(req, res));
router.get('/', (req, res) => boxController.getAll(req, res));
router.get('/:id', (req, res) => boxController.getById(req, res));
router.put('/:id', (req, res) => boxController.update(req, res));
router.delete('/:id', (req, res) => boxController.delete(req, res));
router.patch('/:id/state', (req, res) => boxController.changeState(req, res));
router.patch('/assignate',(req,res) => boxController.assignateBoxToUser(req,res));

module.exports = router;
