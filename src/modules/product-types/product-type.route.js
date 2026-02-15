const express = require('express');
const router = express.Router();
const productTypeController = require('./product-type.controller');

/**
 * @swagger
 * /api/product-types:
 *   post:
 *     summary: Creer un product type
 *     tags: [Product Types]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductTypeCreate'
 *     responses:
 *       201:
 *         description: Product type cree avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProductType'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', (req, res) => productTypeController.create(req, res));

/**
 * @swagger
 * /api/product-types:
 *   get:
 *     summary: Recuperer tous les product types
 *     tags: [Product Types]
 *     responses:
 *       200:
 *         description: Liste des product types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProductTypeList'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', (req, res) => productTypeController.getAll(req, res));

/**
 * @swagger
 * /api/product-types/{id}:
 *   get:
 *     summary: Recuperer un product type par ID
 *     tags: [Product Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du product type
 *     responses:
 *       200:
 *         description: Product type trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProductType'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', (req, res) => productTypeController.getById(req, res));

/**
 * @swagger
 * /api/product-types/{id}:
 *   put:
 *     summary: Mettre a jour un product type
 *     tags: [Product Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du product type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductTypeUpdate'
 *     responses:
 *       200:
 *         description: Product type mis a jour avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProductType'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', (req, res) => productTypeController.update(req, res));

/**
 * @swagger
 * /api/product-types/{id}:
 *   delete:
 *     summary: Supprimer un product type
 *     tags: [Product Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du product type
 *     responses:
 *       200:
 *         description: Product type supprime avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', (req, res) => productTypeController.delete(req, res));

module.exports = router;
