const Product = require('./product.model');

class ProductRepository {

    async create(data) {
        const product = new Product(data);
        return product.save();
    }

    async findAll(filter = {}) {
        return Product.find(filter);
    }

    async findFiltered(filter = {}) {
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

        return await Product.find(query);
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

}

module.exports = new ProductRepository();
