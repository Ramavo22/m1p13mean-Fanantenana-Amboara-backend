const express = require('express');
const router = express.Router();
const rentController = require('./rent.controller');
const { authenticateToken , authorizeRoles } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * /api/rents:
 *   post:
 *     summary: Creer une location
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentCreate'
 *     responses:
 *       201:
 *         description: Location creee avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseRent'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', authenticateToken, authorizeRoles('ADMIN'), (req, res) => rentController.createRent(req, res));

/**
 * @swagger
 * /api/rents:
 *   get:
 *     summary: Recuperer toutes les locations
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'elements par page
 *     responses:
 *       200:
 *         description: Liste paginee des locations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseRentListPaged'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, authorizeRoles('ADMIN','BOUTIQUE'), (req, res) => rentController.getAllRents(req, res));

/**
 * @swagger
 * /api/rents/{id}:
 *   get:
 *     summary: Recuperer une location par ID
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la location
 *     responses:
 *       200:
 *         description: Location trouvee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseRent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authenticateToken, authorizeRoles('ADMIN','BOUTIQUE'), (req, res) => rentController.getRentById(req, res));

/**
 * @swagger
 * /api/rents/{id}:
 *   delete:
 *     summary: Supprimer une location
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la location
 *     responses:
 *       200:
 *         description: Location supprimee avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), (req, res) => rentController.deleteRent(req, res));

/**
 * @swagger
 * /api/rents/{id}:
 *   put:
 *     summary: Mettre a jour une location
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentUpdate'
 *     responses:
 *       200:
 *         description: Location mise a jour avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseRent'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), (req, res) => rentController.updateRent(req, res));

/**
 * @swagger
 * /api/rents/{id}/pay:
 *   patch:
 *     summary: Payer un loyer
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentPayRequest'
 *     responses:
 *       200:
 *         description: Loyer paye avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseRentPayment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/:id/pay', authenticateToken, authorizeRoles('BOUTIQUE'), (req, res) => rentController.payRent(req, res));

module.exports = router;