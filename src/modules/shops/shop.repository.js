const Shop = require('./shop.model');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class ShopRepository {
    async create(data){
        const shop = new Shop(data);
        return shop.save();
    }

    async findAll(page = 1, limit = 10){
        const skip = (page - 1) * limit;
        const [shops, total] = await Promise.all([
            Shop.find().skip(skip).limit(limit),
            Shop.countDocuments(),
        ]);

        return {
            data: shops,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id){
        return Shop.findById(id);
    }

    async findByOwnerUserId(ownerUserId){
        return Shop.find({ ownerUserId });
    }

    async searchWithOwnerProfile({ status, ownerFullName }, page = 1, limit = 10) {
        const match = {};
        if (status) {
            match.status = status;
        }

        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: 'users',
                    localField: 'ownerUserId',
                    foreignField: '_id',
                    as: 'ownerUser',
                },
            },
            { $unwind: '$ownerUser' },
        ];

        if (ownerFullName) {
            const fullNameRegex = new RegExp(escapeRegex(ownerFullName), 'i');
            pipeline.push({
                $match: {
                    'ownerUser.profile.fullName': { $regex: fullNameRegex },
                },
            });
        }

        const dataPipeline = [
            ...pipeline,
            {
                $project: {
                    name: 1,
                    status: 1,
                    ownerUserId: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    ownerUser: {
                        _id: '$ownerUser._id',
                        profile: '$ownerUser.profile',
                    },
                },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ];

        const countPipeline = [
            ...pipeline,
            { $count: 'total' },
        ];

        const result = await Shop.aggregate([
            {
                $facet: {
                    data: dataPipeline,
                    total: countPipeline,
                },
            },
        ]);

        const total = result[0]?.total?.[0]?.total || 0;

        return {
            data: result[0]?.data || [],
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async update(id, data){
        return Shop.findByIdAndUpdate(id, data, {new: true});
    }

    async delete(id){
        return Shop.findByIdAndDelete(id);
    }
}

module.exports = new ShopRepository();
