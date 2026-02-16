const rentRepository = require('./rent.repository');
const boxRepository = require('../boxes/box.repository');
const shopRepository = require('../shops/shop.repository');

class RentService {
    async createRent(rentData) {
        const box = await boxRepository.findById(rentData.boxId);
        if (!box) {
            throw new Error('Box introuvable');
        }

        const shop = await shopRepository.findById(rentData.shopId);
        if (!shop) {
            throw new Error('Shop introuvable');
        }

        return await rentRepository.createData(rentData);
    }

    async getAllRents(page = 1, limit = 10, populateAll = false) {
        return await rentRepository.findAll(page, limit, populateAll);
    }

    async getRentById(id) {
        const rent = await rentRepository.findById(id);
        if (!rent) {
            throw new Error('Rent introuvable');
        }
    }

    async updateRent(id, data) {
        const rent = await rentRepository.update(id, data);
        if (!rent) {
            throw new Error('Rent introuvable');
        }
        return rent;
    }

    async deleteRent(id) {
        const rent = await rentRepository.delete(id);
        if (!rent) {
            throw new Error('Rent introuvable');
        }
        return rent;
    }
}

module.exports = new RentService();