const Product = require('./product.model');

class ProductRepository {

    async create(data) {
        const product = new Product(data);
        return product.save();
    }

    async findAll(filter = {}) {
        return Product.find(filter);
    }

    async findFiltered(filter = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        // Construction du pipeline d'agrégation
        const matchStage = {
            status: 'ACTIVE' // Seulement les produits actifs
        };

        // Multi-boutiques
        if (filter.shopIds?.length) {
            matchStage['shop._id'] = { $in: filter.shopIds };
        }

        // Multi-typeProduit
        if (filter.typeProduitIds?.length) {
            matchStage.productTypeId = { $in: filter.typeProduitIds };
        }

        // Prix
        if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
            matchStage.price = {};
            if (filter.priceMin !== undefined) matchStage.price.$gte = filter.priceMin;
            if (filter.priceMax !== undefined) matchStage.price.$lte = filter.priceMax;
        }

        // Stock
        if (filter.inStock) {
            matchStage.stock = { $gt: 0 };
        }

        // Attributs dynamiques
        if (filter.attributes) {
            for (const [key, value] of Object.entries(filter.attributes)) {
                matchStage[`attributes.${key}`] = value;
            }
        }

        const pipeline = [
            { $match: matchStage },
            // Lookup pour vérifier le statut de la boutique
            {
                $lookup: {
                    from: 'shops',
                    let: { shopId: { $toObjectId: '$shop._id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$shopId'] },
                                        { $eq: ['$status', 'ACTIVE'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'shopInfo'
                }
            },
            // Filtrer uniquement les produits avec une boutique active
            {
                $match: {
                    shopInfo: { $ne: [] }
                }
            },
            // Lookup pour vérifier que la boutique est assignée à un box actif
            {
                $lookup: {
                    from: 'rents',
                    let: { shopId: { $toObjectId: '$shop._id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$shopId', '$$shopId'] },
                                        { $eq: ['$status', 'ACTIVE'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'activeRent'
                }
            },
            // Filtrer uniquement les produits avec une location active
            {
                $match: {
                    activeRent: { $ne: [] }
                }
            },
            // Retirer les champs temporaires du résultat final
            {
                $project: {
                    activeRent: 0,
                    shopInfo: 0
                }
            },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await Product.aggregate(pipeline);
        const data = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async findMyProductFiltered(){

    }

    /**
     * Produits de la boutique de l'utilisateur, avec le label du productType, sans infos shop
     */
    async findMyProductsPaginated(shopId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: { 'shop._id': shopId } },
            {
                $lookup: {
                    from: 'producttypes',
                    localField: 'productTypeId',
                    foreignField: '_id',
                    as: 'productTypeInfo'
                }
            },
            {
                $addFields: {
                    productTypeName: { $arrayElemAt: ['$productTypeInfo.label', 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    stock: 1,
                    productTypeId: 1,
                    productTypeName: 1,
                    attributes: 1,
                    status: 1,
                    promotion: 1,
                    photoUrl: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ];

        const result = await Product.aggregate(pipeline);
        const data = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }



    async findById(id) {
        return Product.findById(id);
    }

    async update(id, data) {
        return Product.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return Product.findByIdAndDelete(id);
    }

    /**
     * Décrémente atomiquement le stock d'un produit
     * @param {string} id - ID du produit
     * @param {number} qty - Quantité à décrémenter
     */
    async decrementStock(id, qty, session = null) {
        return Product.findByIdAndUpdate(
            id,
            { $inc: { stock: -qty } },
            { new: true, runValidators: true, ...(session ? { session } : {}) }
        );
    }

    // Ré-incrémenter le stock (rollback)
    async incrementStock(id, qty) {
        return Product.findByIdAndUpdate(
            id,
            { $inc: { stock: qty } },
            { new: true }
        );
    }

    /**
     * Récupère tous les produits paginés avec le label du product type
     * @param {Object} filter - Filtres (shopIds, typeProduitIds, priceMin, priceMax, inStock, attributes)
     * @param {number} page - Numéro de page
     * @param {number} limit - Nombre d'éléments par page
     */
    async findAllPaginated(filter = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        // Construction du match query
        const matchQuery = {
            status: 'ACTIVE' // Seulement les produits actifs
        };

        // Multi-boutiques
        if (filter.shopIds?.length) {
            matchQuery['shop._id'] = { $in: filter.shopIds };
        }

        // Multi-typeProduit
        if (filter.typeProduitIds?.length) {
            matchQuery.productTypeId = { $in: filter.typeProduitIds };
        }

        // Prix
        if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
            matchQuery.price = {};
            if (filter.priceMin !== undefined) matchQuery.price.$gte = filter.priceMin;
            if (filter.priceMax !== undefined) matchQuery.price.$lte = filter.priceMax;
        }

        // Stock
        if (filter.inStock) {
            matchQuery.stock = { $gt: 0 };
        }

        // Attributs dynamiques
        if (filter.attributes) {
            for (const [key, value] of Object.entries(filter.attributes)) {
                matchQuery[`attributes.${key}`] = value;
            }
        }

        const pipeline = [
            { $match: matchQuery },
            // Lookup pour vérifier le statut de la boutique
            {
                $lookup: {
                    from: 'shops',
                    let: { shopId: { $toObjectId: '$shop._id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$shopId'] },
                                        { $eq: ['$status', 'ACTIVE'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'shopInfo'
                }
            },
            // Filtrer uniquement les produits avec une boutique active
            {
                $match: {
                    shopInfo: { $ne: [] }
                }
            },
            // Lookup pour vérifier que la boutique est assignée à un box actif
            {
                $lookup: {
                    from: 'rents',
                    let: { shopId: { $toObjectId: '$shop._id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$shopId', '$$shopId'] },
                                        { $eq: ['$status', 'ACTIVE'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'activeRent'
                }
            },
            // Filtrer uniquement les produits avec une location active
            {
                $match: {
                    activeRent: { $ne: [] }
                }
            },
            {
                $lookup: {
                    from: 'producttypes',
                    localField: 'productTypeId',
                    foreignField: '_id',
                    as: 'productTypeInfo'
                }
            },
            {
                $addFields: {
                    productType: { $arrayElemAt: ['$productTypeInfo.label', 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    stock: 1,
                    productType: 1,
                    shop: '$shop.name',
                    attributes: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    activeRent: 0,
                    shopInfo: 0
                }
            },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await Product.aggregate(pipeline);
        const data = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

}

module.exports = new ProductRepository();
