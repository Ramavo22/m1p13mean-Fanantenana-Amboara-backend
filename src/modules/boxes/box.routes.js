const express = require('express');
const router = express.Router();
const boxController = require('./box.controller');

/**
 * @swagger
 * /api/boxes:
 *   post:
 *     summary: Creer une box
 *     tags: [Boxes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoxCreate'
 *     responses:
 *       201:
 *         description: Box cree avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseBox'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', (req, res) => boxController.create(req, res));

/**
 * @swagger
 * /api/boxes:
 *   get:
 *     summary: Recuperer toutes les boxes
 *     tags: [Boxes]
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
 *         name: state
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, RENTED, REPAIR]
 *         description: Filtrer par etat
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par libelle
 *     responses:
 *       200:
 *         description: Liste des boxes avec pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseBoxListPaged'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', (req, res) => boxController.getAll(req, res));

/**
 * @swagger
 * /api/boxes/{id}:
 *   get:
 *     summary: Recuperer une box par ID
 *     tags: [Boxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de la box
 *     responses:
 *       200:
 *         description: Box trouvee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseBox'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', (req, res) => boxController.getById(req, res));

/**
 * @swagger
 * /api/boxes/{id}:
 *   put:
 *     summary: Mettre a jour une box
 *     tags: [Boxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de la box
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoxUpdate'
 *     responses:
 *       200:
 *         description: Box mise a jour avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseBox'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.put('/:id', (req, res) => boxController.update(req, res));

/**
 * @swagger
 * /api/boxes/{id}:
 *   delete:
 *     summary: Supprimer une box
 *     tags: [Boxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de la box
 *     responses:
 *       200:
 *         description: Box supprimee avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', (req, res) => boxController.delete(req, res));

/**
 * @swagger
 * /api/boxes/{id}/state:
 *   patch:
 *     summary: Changer l'etat d'une box
 *     tags: [Boxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de la box
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoxStateUpdate'
 *     responses:
 *       200:
 *         description: Etat mis a jour avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseBox'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.patch('/:id/state', (req, res) => boxController.changeState(req, res));

/**
 * @swagger
 * /api/boxes/assignate:
 *   patch:
 *     summary: Assigner ou desassigner une box a un utilisateur
 *     tags: [Boxes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoxAssignate'
 *     responses:
 *       200:
 *         description: Assignation effectuee avec succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.patch('/assignate',(req,res) => boxController.assignateBoxToUser(req,res));

module.exports = router;
