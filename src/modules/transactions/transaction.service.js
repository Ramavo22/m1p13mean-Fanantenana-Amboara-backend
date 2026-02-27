const transactionRepository = require('./transaction.repository');

class TransactionService {
    // Créer une nouvelle transaction
    async createTransaction(transactionData) {
        const amount = transactionData.total ?? transactionData.amount;

        if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
            throw new Error('The transaction amount must be greater than zero');
        }

        if (!transactionData.type || !['ACHAT', 'LOYER', 'RECHARGE'].includes(transactionData.type)) {
            throw new Error('Invalid transaction type. Valid types are: ACHAT, LOYER, RECHARGE');
        }
        
        if (!transactionData.userId) {
            throw new Error('The user ID is required to create a transaction');
        }

        if (transactionData.total == null) {
            transactionData.total = amount;
        }

        const transaction = await transactionRepository.create(transactionData);
        return transaction;
    }

    // Récupérer une transaction par ID
    async getTransactionById(transactionId) {
        const transaction = await transactionRepository.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }     return transaction;
    }

    // Récupérer toutes les transactions filtrées d'un utilisateur
    async getTransactionsByUserId(filters = {}, page = 1, limit = 10) {
        await this.validateTransactionFilters(filters.type, filters.startDate, filters.endDate);
        return await transactionRepository.findByUserId(filters, page, limit);
    }

    // Récupérer toutes les transactions filtrées
    async getAllTransactions(filters = {}, page = 1, limit = 10) {
        await this.validateTransactionFilters(filters.type, filters.startDate, filters.endDate);
        return await transactionRepository.findAll(filters, page, limit);
    }

    async validateTransactionFilters(type, startDate, endDate) {
        const validTypes = ['ACHAT', 'LOYER', 'RECHARGE'];

        if (type && !validTypes.includes(type)) {
          throw new Error("Invalid transaction type");
        }

        if (startDate && isNaN(Date.parse(startDate))) {
          throw new Error("Invalid start date");
        }

        if (endDate && isNaN(Date.parse(endDate))) {
          throw new Error("Invalid end date");
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          throw new Error(
            "The start date must be earlier than the end date"
          );
        }
    }

}

module.exports = new TransactionService();