const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

// CRUD produits
router.post('/', authenticateToken, (req, res) => productController.create(req, res));

/**
 * @swagger
 * /api/products/paginated:
 *   get:
 *     summary: Recuperer tous les produits avec pagination (format simplifie)
 *     tags: [Products]
 *     description: Retourne les produits avec le nom du product type et du shop (pas les objets complets)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numero de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Nombre d'elements par page
 *       - in: query
 *         name: shopIds
 *         schema:
 *           type: string
 *           example: "6583d8f3e4b0a1234567890a,6583d8f3e4b0a1234567890b"
 *         description: IDs des boutiques (separes par virgule)
 *       - in: query
 *         name: typeProduitIds
 *         schema:
 *           type: string
 *           example: "PT-00001,PT-00002"
 *         description: IDs des types de produits (separes par virgule)
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *           example: 100
 *         description: Prix minimum
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *           example: 1000
 *         description: Prix maximum
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtrer uniquement les produits en stock
 *     responses:
 *       200:
 *         description: Liste paginee des produits (format simplifie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "PRD-00001"
 *                       name:
 *                         type: string
 *                         example: "IPHONE 16"
 *                       price:
 *                         type: number
 *                         example: 200000
 *                       stock:
 *                         type: number
 *                         example: 10
 *                       productType:
 *                         type: string
 *                         example: "Smartphone"
 *                       shop:
 *                         type: string
 *                         example: "Ma Boutique"
 *                       attributes:
 *                         type: object
 *                         example: { "BRAND": "IPHONE", "RAM": "16GB", "5G": true }
 *                       status:
 *                         type: string
 *                         example: "ACTIVE"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/paginated', (req, res) => productController.getAllPaginated(req, res));

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Recuperer tous les produits avec pagination (format complet)
 *     tags: [Products]
 *     description: Retourne les produits au format complet avec shop et productTypeId
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numero de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Nombre d'elements par page
 *       - in: query
 *         name: shopIds
 *         schema:
 *           type: string
 *           example: "6583d8f3e4b0a1234567890a"
 *         description: IDs des boutiques (separes par virgule)
 *       - in: query
 *         name: typeProduitIds
 *         schema:
 *           type: string
 *           example: "PT-00001,PT-00002"
 *         description: IDs des types de produits (separes par virgule)
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *           example: 100
 *         description: Prix minimum
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *           example: 1000
 *         description: Prix maximum
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtrer uniquement les produits en stock
 *     responses:
 *       200:
 *         description: Liste paginee des produits (format complet)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "PRD-00001"
 *                       name:
 *                         type: string
 *                         example: "IPHONE 16"
 *                       price:
 *                         type: number
 *                         example: 200000
 *                       productTypeId:
 *                         type: string
 *                         example: "PT-00001"
 *                       shop:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6583d8f3e4b0a1234567890a"
 *                           name:
 *                             type: string
 *                             example: "Ma Boutique"
 *                       attributes:
 *                         type: object
 *                         example: { "BRAND": "IPHONE", "RAM": "16GB", "5G": true }
 *                       stock:
 *                         type: number
 *                         example: 10
 *                       promotion:
 *                         type: object
 *                         properties:
 *                           active:
 *                             type: boolean
 *                             example: false
 *                           reduction:
 *                             type: number
 *                             example: 0
 *                       status:
 *                         type: string
 *                         enum: [ACTIVE, INACTIVE]
 *                         example: "ACTIVE"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', (req, res) => productController.getFiltered(req, res));
router.get('/:id', (req, res) => productController.getById(req, res));
router.put('/:id', (req, res) => productController.update(req, res));
router.delete('/:id', (req, res) => productController.delete(req, res));

module.exports = router;
