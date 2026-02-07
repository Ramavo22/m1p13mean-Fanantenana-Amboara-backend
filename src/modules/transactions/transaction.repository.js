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

    // Récupérer toutes les transactions d'un utilisateur
    async findByUserId(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const transactions = await Transaction.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ date: -1 });
        const total = await Transaction.countDocuments({ userId });
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

    // Récupérer toutes les transactions
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const transactions = await Transaction.find()
            .skip(skip)
            .limit(limit)
            .sort({ date: -1 });
        const total = await Transaction.countDocuments();
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