const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');
const { authenticateToken , authorizeRoles } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * /api/shops:
 *   post:
 *     summary: Creer un shop
 *     tags: [Shops]
 *     description: Le ownerUserId est derive du token JWT de l'utilisateur connecte.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Le champ ownerUserId, s'il est fourni, est ignore et remplace par l'identite du token.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShopCreate'
 *     responses:
 *       201:
 *         description: Shop cree avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseShop'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => shopController.create(req, res));

/**
 * @swagger
 * /api/shops:
 *   get:
 *     summary: Recuperer tous les shops
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des shops
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseShopList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'ACHETEUR'), (req, res) => shopController.getAll(req, res));

/**
 * @swagger
 * /api/shops/{id}:
 *   get:
 *     summary: Recuperer un shop par ID
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du shop
 *     responses:
 *       200:
 *         description: Shop trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseShop'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticateToken, authorizeRoles('ADMIN', 'ACHETEUR'), (req, res) => shopController.getById(req, res));

/**
 * @swagger
 * /api/shops/owner/{ownerUserId}:
 *   get:
 *     summary: Recuperer un shop par proprietaire
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du proprietaire
 *     responses:
 *       200:
 *         description: Shop trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseShop'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/owner/:ownerUserId', authenticateToken, (req, res) => shopController.getByOwnerUserId(req, res));

/**
 * @swagger
 * /api/shops/{id}:
 *   put:
 *     summary: Mettre a jour un shop
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShopUpdate'
 *     responses:
 *       200:
 *         description: Shop mis a jour avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseShop'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => shopController.update(req, res));

/**
 * @swagger
 * /api/shops/{id}:
 *   delete:
 *     summary: Supprimer un shop
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du shop
 *     responses:
 *       200:
 *         description: Shop supprime avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => shopController.delete(req, res));

module.exports = router;
