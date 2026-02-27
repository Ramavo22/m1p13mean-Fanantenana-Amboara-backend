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
        return Shop.findById(id).populate('ownerUserId', 'profile').populate('boxId');
    }

    async findByOwnerUserId(ownerUserId){
        const pipeline = [
          {
            $match: {
              ownerUserId: new (require("mongoose").Types.ObjectId)(
                ownerUserId
              ),
            },
          },
          {
            $lookup: {
              from: "boxes",
              localField: "boxId",
              foreignField: "_id",
              as: "assignedBox",
            },
          },
          {
            $addFields: {
              assignedBox: { $arrayElemAt: ["$assignedBox", 0] },
              boxId: "$boxId",
            },
          },
          {
            $lookup: {
              from: "rents",
              localField: "_id",
              foreignField: "shopId",
              as: "rent",
            },
          },
          {
            $addFields: {
                activeRent: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$rent",
                                as: "rentItem",
                                cond: { $eq: ["$$rentItem.status", "ACTIVE"] },
                            },
                        },
                        0,
                    ],
                },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              status: 1,
              ownerUserId: 1,
              boxId: { $toString: "$boxId" },
              assignedBox: "$assignedBox",
              activeRent: "$activeRent",
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ];

        const result = await Shop.aggregate(pipeline);
        return result;
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
            {
                $lookup: {
                    from: 'boxes',
                    localField: 'boxId',
                    foreignField: '_id',
                    as: 'assignedBox',
                },
            },
            {
                $addFields: {
                    assignedBox: { $arrayElemAt: ['$assignedBox', 0] },
                },
            },
            {
                $lookup: {
                    from: 'rents',
                    localField: '_id',
                    foreignField: 'shopId',
                    as: 'rent',
                },
            },
            {
                $addFields: {
                    activeRent: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$rent',
                                    as: 'rentItem',
                                    cond: { $eq: ['$$rentItem.status', 'ACTIVE'] },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
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
                    boxId: '$assignedBox._id',
                    assignedBox: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    ownerUser: {
                        _id: '$ownerUser._id',
                        profile: '$ownerUser.profile',
                    },
                    activeRent: '$activeRent',
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

    /**
     * Récupère l'id et le nom de la boutique d'un utilisateur
     * @param {string} userId - ID de l'utilisateur (depuis req.user.sub)
     * @returns {Promise<{_id: string, name: string} | null>}
     */
    async findShopByUserId(userId){
        return Shop.findOne({ ownerUserId: userId }).select('_id name').lean();
    }
}

module.exports = new ShopRepository();
