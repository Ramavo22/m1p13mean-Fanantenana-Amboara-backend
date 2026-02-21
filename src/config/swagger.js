const swaggerJsdoc = require('swagger-jsdoc');

// Déterminer l'URL du serveur pour la documentation Swagger.
// Utiliser la variable d'environnement `SWAGGER_BASE_URL` si fournie.
// En production (ex: Vercel) utiliser '/' pour des requêtes relatives.
const serverUrl = process.env.SWAGGER_BASE_URL || (process.env.NODE_ENV === 'production' ? '/' : `http://localhost:${process.env.PORT || 3000}`);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestion - Documentation',
      version: '1.0.0',
      description: "Documentation complete de l'API de gestion",
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Serveur de developpement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Shop: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du shop',
              example: '66b2f0d8cdbd8f1a9d2f1c44',
            },
            name: {
              type: 'string',
              description: 'Nom du shop',
              example: 'Boutique Centrale',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Statut du shop',
              example: 'ACTIVE',
            },
            ownerUserId: {
              type: 'string',
              description: 'ID du proprietaire',
              example: '66b2f0d8cdbd8f1a9d2f1c11',
            },
            boxId: {
              type: 'string',
              description: 'ID de la box assignee',
              nullable: true,
              example: '66b2f0d8cdbd8f1a9d2f1c33',
            },
            assignedBox: {
              nullable: true,
              $ref: '#/components/schemas/Box',
              description: 'Details de la box assignee au shop',
            },
            activeRent: {
              nullable: true,
              $ref: '#/components/schemas/Rent',
              description: 'Location active associee au shop',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de creation',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        ShopWithOwner: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du shop',
              example: '66b2f0d8cdbd8f1a9d2f1c44',
            },
            name: {
              type: 'string',
              description: 'Nom du shop',
              example: 'Boutique Centrale',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Statut du shop',
              example: 'ACTIVE',
            },
            ownerUserId: {
              type: 'string',
              description: 'ID du proprietaire',
              example: '66b2f0d8cdbd8f1a9d2f1c11',
            },
            ownerUser: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  description: "ID unique de l'utilisateur",
                },
                profile: {
                  $ref: '#/components/schemas/UserProfile',
                },
              },
            },
            boxId: {
              type: 'string',
              description: 'ID de la box assignee',
              nullable: true,
              example: '66b2f0d8cdbd8f1a9d2f1c33',
            },
            assignedBox: {
              nullable: true,
              $ref: '#/components/schemas/Box',
              description: 'Details de la box assignee au shop',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de creation',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        ShopCreate: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Nom du shop',
              example: 'Boutique Centrale',
            },
            ownerUserId: {
              type: 'string',
              description: 'ID du proprietaire',
              example: '66b2f0d8cdbd8f1a9d2f1c11',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Statut du shop',
              example: 'ACTIVE',
            },
          },
        },
        ShopUpdate: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nom du shop',
              example: 'Boutique Centrale',
            },
            ownerUserId: {
              type: 'string',
              description: 'ID du proprietaire',
              example: '66b2f0d8cdbd8f1a9d2f1c11',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Statut du shop',
              example: 'INACTIVE',
            },
          },
        },
        Box: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de la box',
              example: '66b2f0d8cdbd8f1a9d2f1c33',
            },
            label: {
              type: 'string',
              description: 'Libelle de la box',
              example: 'Box A1',
            },
            state: {
              type: 'string',
              enum: ['AVAILABLE', 'RENTED', 'REPAIR'],
              description: 'Etat de la box',
              example: 'AVAILABLE',
            },
            rent: {
              type: 'number',
              description: 'Prix de location',
              example: 1500,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de creation',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        BoxCreate: {
          type: 'object',
          required: ['label', 'rent'],
          properties: {
            label: {
              type: 'string',
              description: 'Libelle de la box',
              example: 'Box A1',
            },
            rent: {
              type: 'number',
              minimum: 0,
              description: 'Prix de location',
              example: 1500,
            },
            state: {
              type: 'string',
              enum: ['AVAILABLE', 'RENTED', 'REPAIR'],
              description: 'Etat de la box',
              example: 'AVAILABLE',
            },
          },
        },
        BoxUpdate: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Libelle de la box',
              example: 'Box A1',
            },
            rent: {
              type: 'number',
              minimum: 0,
              description: 'Prix de location',
              example: 1500,
            },
            state: {
              type: 'string',
              enum: ['AVAILABLE', 'RENTED', 'REPAIR'],
              description: 'Etat de la box',
              example: 'REPAIR',
            },
          },
        },
        BoxStateUpdate: {
          type: 'object',
          required: ['state'],
          properties: {
            state: {
              type: 'string',
              enum: ['AVAILABLE', 'RENTED', 'REPAIR'],
              description: 'Nouvel etat de la box',
              example: 'REPAIR',
            },
          },
        },
        BoxAssignate: {
          type: 'object',
          required: ['boxId', 'isAssignate'],
          properties: {
            rent: {
              type: 'number',
              minimum: 0,
              description: 'Montant du loyer (obligatoire pour une assignation, ignore pour une desassignation)',
              example: 1500,
            },
            frequency: {
              type: 'string',
              enum: ['WEEKLY', 'MONTHLY', 'YEARLY'],
              description: 'Frequence de paiement du loyer (obligatoire pour une assignation, ignore pour une desassignation)',
              example: 'MONTHLY',
            },
            boxId: {
              type: 'string',
              description: 'ID de la box',
              example: '66b2f0d8cdbd8f1a9d2f1c33',
            },
            shopId: {
              type: 'string',
              description: 'ID du shop a assigner',
              example: '66b2f0d8cdbd8f1a9d2f1c44',
            },
            isAssignate: {
              type: 'boolean',
              description: 'true pour assigner, false pour desassigner',
              example: true,
            },
          },
        },
        Rent: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de la location',
              example: '66b2f0d8cdbd8f1a9d2f1c55',
            },
            boxId: {
              type: 'string',
              description: 'ID de la box louee',
              example: '66b2f0d8cdbd8f1a9d2f1c33',
            },
            shopId: {
              type: 'string',
              description: 'ID du shop locataire',
              example: '66b2f0d8cdbd8f1a9d2f1c44',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de debut de la location',
            },
            nextDeadline: {
              type: 'string',
              format: 'date-time',
              description: 'Prochaine date d echeance',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
              description: 'Statut de la location',
              example: 'ACTIVE',
            },
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Montant du loyer',
              example: 1500,
            },
            frequency: {
              type: 'string',
              enum: ['WEEKLY', 'MONTHLY', 'YEARLY'],
              description: 'Frequence de paiement',
              example: 'MONTHLY',
            },
          },
        },
        RentCreate: {
          type: 'object',
          required: ['boxId', 'shopId', 'startDate', 'amount', 'frequency'],
          properties: {
            boxId: {
              type: 'string',
              description: 'ID de la box louee',
              example: '66b2f0d8cdbd8f1a9d2f1c33',
            },
            shopId: {
              type: 'string',
              description: 'ID du shop locataire',
              example: '66b2f0d8cdbd8f1a9d2f1c44',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de debut de la location',
              example: '2026-02-01T00:00:00.000Z',
            },
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Montant du loyer',
              example: 1500,
            },
            frequency: {
              type: 'string',
              enum: ['WEEKLY', 'MONTHLY', 'YEARLY'],
              description: 'Frequence de paiement',
              example: 'MONTHLY',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
              description: 'Statut de la location',
              example: 'ACTIVE',
            },
          },
        },
        RentUpdate: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de debut de la location',
            },
            nextDeadline: {
              type: 'string',
              format: 'date-time',
              description: 'Prochaine date d echeance',
            },
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Montant du loyer',
            },
            frequency: {
              type: 'string',
              enum: ['WEEKLY', 'MONTHLY', 'YEARLY'],
              description: 'Frequence de paiement',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
              description: 'Statut de la location',
            },
          },
        },
        RentPayRequest: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: {
              type: 'string',
              description: "ID de l'utilisateur qui paie",
              example: '66b2f0d8cdbd8f1a9d2f1c11',
            },
            periode: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}$',
              description: 'Periode du loyer au format YYYY-MM',
              example: '2026-02',
            },
          },
        },
        RentPaymentResult: {
          type: 'object',
          properties: {
            rent: {
              $ref: '#/components/schemas/Rent',
            },
            transaction: {
              $ref: '#/components/schemas/Transaction',
            },
          },
        },
        ProductTypeAttribute: {
          type: 'object',
          required: ['code', 'type'],
          properties: {
            code: {
              type: 'string',
              description: 'Code unique de l attribut',
              example: 'COLOR',
            },
            type: {
              type: 'string',
              enum: ['ENUM', 'NUMBER', 'STRING', 'BOOLEAN', 'DATE'],
              description: 'Type de l attribut',
              example: 'ENUM',
            },
            values: {
              type: 'array',
              items: { type: 'string' },
              description: 'Valeurs possibles pour le type ENUM',
              example: ['RED', 'GREEN', 'BLUE'],
            },
            min: {
              type: 'number',
              description: 'Valeur minimale pour le type NUMBER',
              example: 0,
            },
            max: {
              type: 'number',
              description: 'Valeur maximale pour le type NUMBER',
              example: 100,
            },
          },
        },
        ProductType: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du product type',
              example: '66b2f0d8cdbd8f1a9d2f1c22',
            },
            label: {
              type: 'string',
              description: 'Libelle du product type',
              example: 'Electromenager',
            },
            attributes: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductTypeAttribute' },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de creation',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        ProductTypeCreate: {
          type: 'object',
          required: ['_id', 'label'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du product type',
              example: '66b2f0d8cdbd8f1a9d2f1c22',
            },
            label: {
              type: 'string',
              description: 'Libelle du product type',
              example: 'Electromenager',
            },
            attributes: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductTypeAttribute' },
            },
          },
        },
        ProductTypeUpdate: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Libelle du product type',
              example: 'Electromenager',
            },
            attributes: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductTypeAttribute' },
            },
          },
        },
        UserProfile: {
          type: 'object',
          required: ['fullName', 'tel'],
          properties: {
            fullName: {
              type: 'string',
              description: 'Nom complet',
            },
            tel: {
              type: 'string',
              description: 'Numero de telephone (10 chiffres)',
              example: '0612345678',
            },
            solde: {
              type: 'number',
              description: 'Solde du compte',
              example: 0,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email',
            },
          },
        },
        UserCreate: {
          type: 'object',
          required: ['role', 'login', 'password', 'profile'],
          properties: {
            role: {
              type: 'string',
              enum: ['ADMIN', 'BOUTIQUE', 'ACHETEUR'],
              description: 'Role utilisateur',
              example: 'ACHETEUR',
            },
            login: {
              type: 'string',
              description: "Nom d'utilisateur",
              example: 'john_doe',
            },
            password: {
              type: 'string',
              description: 'Mot de passe',
              example: 'password123',
            },
            profile: {
              $ref: '#/components/schemas/UserProfile',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
              description: "Statut de l'utilisateur",
              example: 'ACTIVE',
            },
          },
        },
        UserUpdate: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['ADMIN', 'BOUTIQUE', 'ACHETEUR'],
            },
            login: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
            },
            profile: {
              $ref: '#/components/schemas/UserProfile',
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: "ID unique de l'utilisateur",
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'BOUTIQUE', 'ACHETEUR'],
              description: 'Role utilisateur',
            },
            login: {
              type: 'string',
              description: "Nom d'utilisateur",
            },
            profile: {
              $ref: '#/components/schemas/UserProfile',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
              description: "Statut de l'utilisateur",
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de creation',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de la transaction',
            },
            type: {
              type: 'string',
              enum: ['ACHAT', 'RECHARGE', 'LOYER'],
              description: 'Type de transaction',
            },
            total: {
              type: 'number',
              description: 'Montant total de la transaction',
              example: 120.5,
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date de la transaction',
            },
            userId: {
              type: 'string',
              description: "ID de l'utilisateur",
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de creation',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
            rentId: {
              type: 'string',
              nullable: true,
              description: 'ID de la location liee (present surtout pour les loyers)',
            },
            periode: {
              type: 'string',
              nullable: true,
              pattern: '^\\d{4}-\\d{2}$',
              description: 'Periode de paiement au format YYYY-MM (pour les loyers)',
              example: '2026-02',
            },
          },
        },
        TransactionCreate: {
          type: 'object',
          required: ['type', 'userId'],
          anyOf: [
            { required: ['total'] },
            { required: ['amount'] },
          ],
          properties: {
            type: {
              type: 'string',
              enum: ['ACHAT', 'RECHARGE', 'LOYER'],
              description: 'Type de transaction',
            },
            total: {
              type: 'number',
              minimum: 0,
              description: 'Montant total de la transaction',
              example: 120.5,
            },
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Alias accepte de total',
              example: 120.5,
            },
            userId: {
              type: 'string',
              description: "ID de l'utilisateur",
              example: '66b2f0d8cdbd8f1a9d2f1c11',
            },
            rentId: {
              type: 'string',
              description: 'ID de la location (type LOYER)',
              example: '66b2f0d8cdbd8f1a9d2f1c55',
            },
            periode: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}$',
              description: 'Periode de paiement au format YYYY-MM (type LOYER)',
              example: '2026-02',
            },
          },
        },
        TransactionListPaged: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Transaction' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            pages: { type: 'integer', example: 10 },
          },
        },
        ApiResponseUser: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/UserResponse' },
          },
        },
        ApiResponseTransaction: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/Transaction' },
          },
        },
        ApiResponseUserList: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserResponse' },
            },
          },
        },
        ApiResponseUserListPaged: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserResponse' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        ApiResponseTransactionListPaged: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Transaction' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        ApiResponseMessage: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        ApiResponseShop: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/Shop' },
          },
        },
        ApiResponseShopList: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Shop' },
            },
          },
        },
        ApiResponseShopListPaged: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Shop' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        ApiResponseShopListWithOwner: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ShopWithOwner' },
            },
          },
        },
        ApiResponseShopListWithOwnerPaged: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ShopWithOwner' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        ApiResponseShopWithOwner: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              allOf: [{ $ref: '#/components/schemas/ShopWithOwner' }],
              nullable: true,
            },
          },
        },
        ApiResponseBox: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/Box' },
          },
        },
        ApiResponseBoxListPaged: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Box' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        ApiResponseRent: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/Rent' },
          },
        },
        ApiResponseRentListPaged: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Rent' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        ApiResponseRentPayment: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/RentPaymentResult' },
          },
        },
        ApiResponseProductType: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/ProductType' },
          },
        },
        ApiResponseProductTypeList: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductType' },
            },
          },
        },
        ApiResponseProductTypeListPaged: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductType' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Requete invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Unauthorized: {
          description: 'Non authentifie',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Forbidden: {
          description: 'Acces refuse',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Ressource non trouvee',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
