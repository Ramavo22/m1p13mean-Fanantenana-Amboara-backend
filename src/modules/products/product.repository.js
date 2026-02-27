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
        const query = {};

        // Multi-boutiques
        if (filter.shopIds?.length) {
            query['shop._id'] = { $in: filter.shopIds };
        }

        // Multi-typeProduit
        if (filter.typeProduitIds?.length) {
            query.productTypeId = { $in: filter.typeProduitIds };
        }

        // Prix
        if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
            query.price = {};
            if (filter.priceMin !== undefined) query.price.$gte = filter.priceMin;
            if (filter.priceMax !== undefined) query.price.$lte = filter.priceMax;
        }

        // Stock
        if (filter.inStock) {
            query.stock = { $gt: 0 };
        }

        // Attributs dynamiques
        if (filter.attributes) {
            for (const [key, value] of Object.entries(filter.attributes)) {
                query[`attributes.${key}`] = value;
            }
        }

        const [products, total] = await Promise.all([
            Product.find(query).skip(skip).limit(limit),
            Product.countDocuments(query)
        ]);
        return {
            data: products,
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
        const matchQuery = {};

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
                    updatedAt: 1
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
