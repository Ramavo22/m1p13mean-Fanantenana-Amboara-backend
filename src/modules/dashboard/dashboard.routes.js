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

module.exports = router;
