const rentRepository = require('./rent.repository');
const boxRepository = require('../boxes/box.repository');
const shopRepository = require('../shops/shop.repository');
const transactionRepository = require('../transactions/transaction.repository');

class RentService {

    setNextDeadline(periodeDate, frequency = 'MONTHLY') {
        const now = new Date(periodeDate);
        switch (frequency) {
            case 'WEEKLY':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            case 'MONTHLY':
                return new Date(now.setMonth(now.getMonth() + 1));
            case 'YEARLY':
                return new Date(now.setFullYear(now.getFullYear() + 1));
            default:
                throw new Error('Fréquence invalide');
        }
    }

    async createRent(rentData) {
        const box = await boxRepository.findById(rentData.boxId);
        if (!box) {
            throw new Error('Box introuvable');
        }

        const shop = await shopRepository.findById(rentData.shopId);
        if (!shop) {
            throw new Error('Boutique introuvable');
        }

        // A la création d'une location, on définit la date de la prochaine échéance en fonction de la date de début et de la fréquence
        rentData.nextDeadline = this.setNextDeadline(rentData.startDate, rentData.frequency);

        return await rentRepository.createData(rentData);
    }

    async getAllRents(page = 1, limit = 10, populateAll = false) {
        return await rentRepository.findAll(page, limit, populateAll);
    }

    async getRentById(id) {
        const rent = await rentRepository.findById(id);
        if (!rent) {
            throw new Error('Location introuvable');
        }
        return rent;
    }

    async getActiveRentByBoxAndShop(boxId, shopId) {
        return await rentRepository.findActiveByBoxAndShop(boxId, shopId);
    }

    async updateRent(id, data) {
        const allowableStatus= ['ACTIVE', 'EXPIRED', 'CANCELLED'];

        if (data.status && !allowableStatus.includes(data.status)) {
            throw new Error('Statut de location invalide');
        }

        const rent = await rentRepository.update(id, data);
        if (!rent) {
            throw new Error('Location introuvable');
        }
        return rent;
    }

    async deleteRent(id) {
        const rent = await rentRepository.delete(id);
        if (!rent) {
            throw new Error('Location introuvable');
        }
        return rent;
    }

    async payRentById(rentId, userId, periode) {
        const rent = await rentRepository.findById(rentId);
        if (!rent) {
            throw new Error('Location introuvable');
        }

        if (rent.status !== 'ACTIVE') {
            throw new Error('Seules les locations actives peuvent être payées');
        }

        if (periode) {
            this.validatePeriod(periode);
        }

        const transactionPeriod = periode || this.formatPeriod(rent.nextDeadline);

        // Vérifier que la période n'est pas antérieure à la date de début de la location
        const startPeriod = this.formatPeriod(rent.startDate);
        if (transactionPeriod < startPeriod) {
            throw new Error('La période ne peut pas être antérieure à la date de début de la location');
        }

        // Vérifier qu'il n'y a pas de périodes impayées avant la période choisie
        const expectedPeriods = this.generateExpectedPeriods(rent.startDate, transactionPeriod, rent.frequency);
        if (expectedPeriods.length > 0) {
            const paidPeriods = await transactionRepository.findPaidPeriodsByRentId(rent._id);
            const unpaidPeriods = expectedPeriods.filter(p => !paidPeriods.includes(p));
            if (unpaidPeriods.length > 0) {
                throw new Error(`Vous avez encore des périodes impayées : ${unpaidPeriods.map(p => this.formatPeriodLabel(p)).join(', ')}`);
            }
        }

        const transactionData = await this.createTransaction(rent, userId, transactionPeriod);

        // Au paiement d'une location, on met à jour la date de la prochaine échéance en fonction de la dernière échéance et la fréquence
        rent.nextDeadline = this.setNextDeadline(rent.nextDeadline, rent.frequency);
        await rent.save();

        return { rent, transaction: transactionData };
    }

    validatePeriod(periode) {
        const periodValue = String(periode || "");
        if (!/^\d{4}-\d{2}$/.test(periodValue)) {
          throw new Error("Période invalide");
        }
        const month = Number(periodValue.split("-")[1]);
        if (month < 1 || month > 12) {
          throw new Error("Période invalide");
        }
    }

    formatPeriod(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    formatPeriodLabel(period) {
        const [year, month] = period.split('-');
        const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        return `${monthNames[Number(month) - 1]} ${year}`;
    }

    generateExpectedPeriods(startDate, targetPeriod, frequency) {
        const periods = [];
        let current = new Date(startDate);

        while (true) {
            const period = this.formatPeriod(current);
            if (period >= targetPeriod) break;
            periods.push(period);
            current = this.setNextDeadline(new Date(current), frequency);
        }

        return periods;
    }

    async createTransaction(rent, userId, periode) {
        try {
          let transactionData = {
            type: "LOYER",
            total: rent.amount,
            rentId: rent._id,
            date: new Date(),
            userId,
            periode,
          };
          transactionData = await transactionRepository.create(transactionData);
          return transactionData;
        } catch (error) {
          // Duplicate key error -> payment for this rent and period already exists
          if (error && error.code === 11000) {
            throw new Error("Le loyer pour cette période a déjà été payé");
          }
          throw error;
        }
    }
}

module.exports = new RentService();