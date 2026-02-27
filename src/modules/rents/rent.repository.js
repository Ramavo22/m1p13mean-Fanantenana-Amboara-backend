const Rent = require('./rent.model');
const mongoose = require('mongoose');

class RentRepository {
    async createData(rentData) {
        const rent = new Rent(rentData);
        return await rent.save();
    }

    async findAll(filter = {}, page = 1, limit = 10, populateAll = false) {
        const skip = (page - 1) * limit;
        const [rents, total] = await Promise.all([
            populateAll ? Rent.find(filter)
                .populate('box')
                .populate('shop')
            .skip(skip).limit(limit) : Rent.find().skip(skip).limit(limit),
            Rent.countDocuments()
        ]);
        return { 
            data: rents,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
         };
    }

    async findById(id) {
        return await Rent.findById(id);
    }

    async findActiveByBoxAndShop(boxId, shopId) {
        return await Rent.findOne({
            boxId,
            shopId,
            status: 'ACTIVE'
        });
    }

    async update(id, data) {
        return await Rent.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async delete(id) {
        return await Rent.findByIdAndDelete(id);
    }

}

module.exports = new RentRepository();