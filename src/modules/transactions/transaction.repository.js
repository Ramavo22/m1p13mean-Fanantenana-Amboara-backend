const Transaction = require('./transactions.model');

class TransactionRepository {
    // Créer une nouvelle transaction
    async create(transactionData) {
        const transaction = new Transaction(transactionData);
        return await transaction.save();
    }

    // Récupérer une transaction par ID
    async findById(transactionId) {
        return await Transaction.findById(transactionId);
    }

    // Récupérer toutes les transactions filtrées d'un utilisateur
    async findByUserId(userId, type, startDate, endDate, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = { userId };
        if (type) filter.type = type;
        if (startDate || endDate) filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
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
    async findAll(type, startDate, endDate, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = {};
        if (type) filter.type = type;
        if (startDate || endDate) filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
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

}

module.exports = new TransactionRepository();