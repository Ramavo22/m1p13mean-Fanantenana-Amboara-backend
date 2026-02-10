const express = require('express');
const transactionController = require('./transaction.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Creer une nouvelle transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionCreate'
 *           example:
 *             type: ACHAT
 *             total: 120.5
 *             userId: 66b2f0d8cdbd8f1a9d2f1c11
 *     responses:
 *       201:
 *         description: Transaction creee avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTransaction'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authenticateToken, (req, res) => transactionController.create(req, res));

/**
 * @swagger
 * /api/transactions/user/{userId}:
 *   get:
 *     summary: Recuperer les transactions d'un utilisateur
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ACHAT, RECHARGE, LOYER]
 *         description: Filtrer par type de transaction
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de debut (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin (ISO 8601)
 *     responses:
 *       200:
 *         description: Transactions recuperees avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTransactionListPaged'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/user/:userId', authenticateToken, (req, res) => transactionController.getUserTransactions(req, res));

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Recuperer une transaction par ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transaction
 *     responses:
 *       200:
 *         description: Transaction recuperee avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTransaction'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authenticateToken, (req, res) => transactionController.getById(req, res));

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Recuperer toutes les transactions
 *     tags: [Transactions]
 *     security:
 *      - bearerAuth: []
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ACHAT, RECHARGE, LOYER]
 *         description: Filtrer par type de transaction
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de debut (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin (ISO 8601)
 *     responses:
 *       200:
 *         description: Transactions recuperees avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTransactionListPaged'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, (req, res) => transactionController.getAll(req, res));

module.exports = router;