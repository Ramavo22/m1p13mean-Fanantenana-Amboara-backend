const swaggerJsdoc = require('swagger-jsdoc');

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
        url: `http://localhost:${process.env.PORT || 3000}`,
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
        ApiResponseMessage: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
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
