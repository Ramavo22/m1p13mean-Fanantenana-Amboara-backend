const express = require('express');
const router = express.Router();
const couponController = require('./coupon.controller');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

router.post('/', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => couponController.create(req, res));
router.get('/', (req, res) => couponController.getAll(req, res));
router.get('/active', (req, res) => couponController.getActive(req, res));
router.get('/my-coupons', authenticateToken, authorizeRoles('ACHETEUR', 'BOUTIQUE'), (req, res) => couponController.getMyCoupons(req, res));
router.get('/code/:code', authenticateToken, authorizeRoles('ACHETEUR'), (req, res) => couponController.getValidCouponByCode(req, res));
router.get('/:id/details', (req, res) => couponController.getDetails(req, res));
router.get('/:id', (req, res) => couponController.getById(req, res));
router.put('/:id', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => couponController.update(req, res));
router.delete('/:id', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => couponController.delete(req, res));

module.exports = router;