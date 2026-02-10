const express = require('express');
const userController = require('./user.controller');
const UserDTO = require('./user.dto');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Middleware de validation pour créer un utilisateur
const validateCreateUser = (req, res, next) => {
  const validation = UserDTO.validateCreateUser(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: validation.errors,
    });
  }
  req.body = UserDTO.createUserDTO(req.body);
  next();
};

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [login, password]
 *             properties:
 *               login:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Authentification reussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', (req, res) => userController.login(req, res));

// Middleware de validation pour mettre à jour un utilisateur
const validateUpdateUser = (req, res, next) => {
  const validation = UserDTO.validateUpdateUser(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: validation.errors,
    });
  }
  req.body = UserDTO.updateUserDTO(req.body);
  next();
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Creer un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *           example:
 *             role: ACHETEUR
 *             login: john_doe
 *             password: password123
 *             profile:
 *               fullName: John Doe
 *               tel: 0612345678
 *               email: john@example.com
 *     responses:
 *       201:
 *         description: Utilisateur cree avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', validateCreateUser, (req, res) => userController.create(req, res));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Recuperer tous les utilisateurs
 *     tags: [Utilisateurs]
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
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, BOUTIQUE, ACHETEUR]
 *         description: Filtrer par role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des utilisateurs avec pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUserListPaged'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, (req, res) => userController.getAll(req, res));

/**
 * @swagger
 * /api/users/role/{role}:
 *   get:
 *     summary: Recuperer les utilisateurs par role
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ADMIN, BOUTIQUE, ACHETEUR]
 *         description: Role de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des utilisateurs pour le role specifie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUserList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/role/:role', authenticateToken, (req, res) => userController.getByRole(req, res));

/**
 * @swagger
 * /api/users/status/{status}:
 *   get:
 *     summary: Recuperer les utilisateurs par statut
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Statut de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des utilisateurs pour le statut specifie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUserList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/status/:status', authenticateToken, (req, res) => userController.getByStatus(req, res));

/**
 * @swagger
 * /api/users/login/{login}:
 *   get:
 *     summary: Recuperer un utilisateur par login
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: login
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom d'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/login/:login', authenticateToken, (req, res) => userController.getByLogin(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Recuperer un utilisateur par ID
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authenticateToken, (req, res) => userController.getById(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre a jour un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Utilisateur mis a jour avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authenticateToken, validateUpdateUser, (req, res) => userController.update(req, res));

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Changer le statut d'un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Statut mis a jour avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/status', authenticateToken, (req, res) => userController.changeStatus(req, res));

/**
 * @swagger
 * /api/users/{id}/solde:
 *   patch:
 *     summary: Mettre a jour le solde d'un utilisateur (ACHETEUR uniquement)
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1500.5
 *               type:
 *                 type: string
 *                 enum: [ACHAT, RECHARGE]
 *                 example: RECHARGE
 *     responses:
 *       200:
 *         description: Solde mis a jour avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/solde', authenticateToken, authorizeRoles('ACHETEUR'), (req, res) => userController.updateSolde(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprime avec succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authenticateToken, (req, res) => userController.delete(req, res));

module.exports = router;
