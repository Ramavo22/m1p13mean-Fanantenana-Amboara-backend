const express = require('express');
const dashboardController = require('./dashboard.controller');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Recuperer les statistiques du dashboard admin
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques recuperees avec succes
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/admin', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
	dashboardController.getAdminOverview(req, res);
});

router.get('/admin/net-sales', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
    dashboardController.getAdminNetSales(req, res);
});

router.get('/boutique', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => {
    dashboardController.getBoutiqueOverview(req, res);
});

module.exports = router;
