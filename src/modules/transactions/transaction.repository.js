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

}

module.exports = new TransactionRepository();