const transactionRepository = require('./transaction.repository');

class TransactionService {
    // Créer une nouvelle transaction
    async createTransaction(transactionData) {
        const amount = transactionData.total ?? transactionData.amount;

        if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
            throw new Error('Le montant de la transaction doit être supérieur à zéro');
        }

        if (!transactionData.type || !['ACHAT', 'LOYER', 'RECHARGE'].includes(transactionData.type)) {
            throw new Error('Type de transaction invalide');
        }
        
        if (!transactionData.userId) {
            throw new Error('L\'ID de l\'utilisateur est requis pour créer une transaction');
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
            throw new Error('Transaction non trouvée');
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
          throw new Error("Type de transaction invalide");
        }

        if (startDate && isNaN(Date.parse(startDate))) {
          throw new Error("Date de début invalide");
        }

        if (endDate && isNaN(Date.parse(endDate))) {
          throw new Error("Date de fin invalide");
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          throw new Error(
            "La date de début doit être antérieure à la date de fin"
          );
        }
    }

}

module.exports = new TransactionService();