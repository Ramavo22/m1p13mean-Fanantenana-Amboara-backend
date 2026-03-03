const express = require('express');
const router = express.Router();
const storageController = require('./storage.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Storage
 *   description: Gestion du stockage Supabase
 */

/**
 * @swagger
 * /api/storage/test-connection:
 *   get:
 *     summary: Test de connexion Supabase - Liste tous les buckets
 *     tags: [Storage]
 *     responses:
 *       200:
 *         description: Connexion réussie et liste des buckets
 *       500:
 *         description: Erreur de connexion
 */
router.get('/test-connection', authenticateToken, storageController.listBuckets);

/**
 * @swagger
 * /api/storage/buckets:
 *   get:
 *     summary: Liste tous les buckets Supabase
 *     tags: [Storage]
 *     responses:
 *       200:
 *         description: Liste des buckets récupérée
 *   post:
 *     summary: Créer un nouveau bucket
 *     tags: [Storage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bucketName
 *             properties:
 *               bucketName:
 *                 type: string
 *                 description: Nom du bucket
 *               isPublic:
 *                 type: boolean
 *                 description: Le bucket est-il public
 *                 default: true
 *     responses:
 *       201:
 *         description: Bucket créé avec succès
 *       400:
 *         description: Données invalides
 */
router.get('/buckets', authenticateToken, storageController.listBuckets);
router.post('/buckets', authenticateToken, storageController.createBucket);

/**
 * @swagger
 * /api/storage/buckets/{bucketName}/files:
 *   get:
 *     summary: Liste les fichiers dans un bucket
 *     tags: [Storage]
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du bucket
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Chemin du dossier (optionnel)
 *     responses:
 *       200:
 *         description: Liste des fichiers récupérée
 */
router.get('/buckets/:bucketName/files', authenticateToken, storageController.listFilesInBucket);

module.exports = router;
