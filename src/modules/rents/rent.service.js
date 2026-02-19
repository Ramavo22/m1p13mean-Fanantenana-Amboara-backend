const rentRepository = require('./rent.repository');
const boxRepository = require('../boxes/box.repository');
const shopRepository = require('../shops/shop.repository');
const transactionRepository = require('../transactions/transaction.repository');

class RentService {

    setNextDeadline(frequency = 'MONTHLY') {
        const now = new Date();
        switch (frequency) {
            case 'WEEKLY':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            case 'MONTHLY':
                return new Date(now.setMonth(now.getMonth() + 1));
            case 'YEARLY':
                return new Date(now.setFullYear(now.getFullYear() + 1));
            default:
                throw new Error('Fréquence de location invalide');
        }
    }

    async createRent(rentData) {
        const box = await boxRepository.findById(rentData.boxId);
        if (!box) {
            throw new Error('Box introuvable');
        }

        const shop = await shopRepository.findById(rentData.shopId);
        if (!shop) {
            throw new Error('Shop introuvable');
        }

        // Définir la date d'échéance en fonction de la fréquence
        rentData.nextDeadline = this.setNextDeadline(rentData.frequency);

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
        return rent;
    }

    async updateRent(id, data) {
        const allowableStatus= ['ACTIVE', 'EXPIRED', 'CANCELLED'];

        if (data.status && !allowableStatus.includes(data.status)) {
            throw new Error('Status de location invalide');
        }

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

    async payRent(rentId, userId) {
        const rent = await rentRepository.findById(rentId);
        if (!rent) {
            throw new Error('Rent introuvable');
        }

        if (rent.status !== 'ACTIVE') {
            throw new Error('Seules les locations actives peuvent être payées');
        }

        // Mettre à jour la date d'échéance pour la prochaine période
        rent.nextDeadline = this.setNextDeadline(rent.frequency);

        let transactionData;
        try {
            transactionData = {
                type: 'LOYER',
                total: rent.amount,
                rentId: rent._id,
                date: new Date(),
                userId,
                periode: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            };
            await transactionRepository.create(transactionData);
        } catch (error) {
            // Duplicate key error -> payment for this rent and period already exists
            if (error && (error.code === 11000)) {
                throw new Error('Le loyer pour cette periode a deja ete paye');
            }
            throw error;
        }
        await rent.save();

        return { rent, transaction: transactionData };
    }
}

module.exports = new RentService();