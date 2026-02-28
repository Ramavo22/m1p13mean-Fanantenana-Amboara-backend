const Transaction = require('./transactions.model');

class TransactionRepository {
    // Créer une nouvelle transaction (session optionnelle pour les opérations transactionnelles)
    async create(transactionData, session = null) {
        const transaction = new Transaction(transactionData);
        return await transaction.save(session ? { session } : undefined);
    }

    // Récupérer une transaction par ID
    async findById(transactionId) {
        return await Transaction.findById(transactionId);
    }

    // Supprimer une transaction par ID (rollback)
    async deleteById(transactionId) {
        return await Transaction.findByIdAndDelete(transactionId);
    }

    // Récupérer toutes les transactions filtrées d'un utilisateur
    async findByUserId(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = { userId: filters.userId };
        if (filters.type) filter.type = filters.type;
        if (filters.startDate || filters.endDate) filter.date = {};
        if (filters.startDate) filter.date.$gte = new Date(filters.startDate);
        if (filters.endDate) filter.date.$lte = new Date(filters.endDate);
        if (filters.rentId) filter.rentId = filters.rentId;
        const transactions = await Transaction.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ date: -1 });
        const total = await Transaction.countDocuments(filter);
        return {
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    // Récupérer toutes les transactions filtrées
    async findAll(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = {};
        if (filters.type) filter.type = filters.type;
        if (filters.startDate || filters.endDate) filter.date = {};
        if (filters.startDate) filter.date.$gte = new Date(filters.startDate);
        if (filters.endDate) filter.date.$lte = new Date(filters.endDate);
        if (filters.rentId) filter.rentId = filters.rentId;
        const transactions = await Transaction.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ date: -1 });
        const total = await Transaction.countDocuments(filter);
        return {
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async sumLoyerByYear(year) {
        const yearPrefix = `${year}-`;
        const [totalResult, byPeriodeRaw] = await Promise.all([
            Transaction.aggregate([
                {
                    $match: {
                        type: 'LOYER',
                        periode: { $regex: `^${yearPrefix}` },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' },
                    },
                },
            ]),
            Transaction.aggregate([
                {
                    $match: {
                        type: 'LOYER',
                        periode: { $regex: `^${yearPrefix}` },
                    },
                },
                {
                    $group: {
                        _id: '$periode',
                        total: { $sum: '$total' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);
        return {
            total: totalResult[0]?.total || 0,
            byPeriodeRaw,
        };
    }

    async getDistinctBuyers() {
        const uniqueBuyers = await Transaction.distinct('userId', { type: 'ACHAT' });
        return uniqueBuyers.length;
    }

    async getMonthlyCustomersByYear(year) {
        const yearStart = new Date(year, 0, 1);
        const nextYearStart = new Date(year + 1, 0, 1);
        return Transaction.aggregate([
            {
                $match: {
                    type: 'ACHAT',
                    date: { $gte: yearStart, $lt: nextYearStart },
                },
            },
            {
                $group: {
                    _id: { $month: '$date' },
                    users: { $addToSet: '$userId' },
                },
            },
            {
                $project: {
                    _id: 1,
                    total: { $size: '$users' },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
}

module.exports = new TransactionRepository();