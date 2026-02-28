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

/**
 * @swagger
 * /api/dashboard/admin/net-sales:
 *  get:
 *    summary: Recuperer les ventes nettes du dashboard admin
 *    tags: [Dashboard]
 *    security:
 *     - bearerAuth: []
 *    responses:
 *     200:
 *      description: Ventes nettes recuperees avec succes
 *     403:
 *      $ref: '#/components/responses/Forbidden'
 *     500:
 *      $ref: '#/components/responses/InternalServerError'
 */
router.get('/admin/net-sales', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
    dashboardController.getAdminNetSales(req, res);
});

/**
 * @swagger
 * /api/dashboard/boutique:
 *  get:
 *    summary: Recuperer les statistiques du dashboard boutique
 *    tags: [Dashboard]
 *    security:
 *     - bearerAuth: []
 *    responses:
 *     200:
 *      description: Statistiques recuperees avec succes
 *     403:
 *      $ref: '#/components/responses/Forbidden'
 *     500:
 *      $ref: '#/components/responses/InternalServerError'
 */
router.get('/boutique', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => {
    dashboardController.getBoutiqueOverview(req, res);
});

/**
 * @swagger
 * /api/dashboard/boutique/net-sales:
 *  get:
 *    summary: Recuperer les ventes nettes de la boutique
 *    tags: [Dashboard]
 *    security:
 *     - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: year
 *        schema:
 *          type: integer
 *        description: Annee (defaut annee courante)
 *    responses:
 *     200:
 *      description: Ventes nettes recuperees avec succes
 *     403:
 *      $ref: '#/components/responses/Forbidden'
 *     500:
 *      $ref: '#/components/responses/InternalServerError'
 */
router.get('/boutique/net-sales', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => {
    dashboardController.getBoutiqueNetSales(req, res);
});

/**
 * @swagger
 * /api/dashboard/boutique/net-sales/today:
 *  get:
 *    summary: Recuperer le chiffre d'affaire du jour de la boutique
 *    tags: [Dashboard]
 *    security:
 *     - bearerAuth: []
 *    responses:
 *     200:
 *      description: Chiffre d'affaire du jour recupere avec succes
 *     403:
 *      $ref: '#/components/responses/Forbidden'
 *     500:
 *      $ref: '#/components/responses/InternalServerError'
 */
router.get('/boutique/net-sales/today', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => {
    dashboardController.getBoutiqueNetSalesToday(req, res);
});

module.exports = router;
