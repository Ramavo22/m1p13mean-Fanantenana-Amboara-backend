const transactionRepository = require('./transaction.repository');

class TransactionService {
    // Créer une nouvelle transaction
    async createTransaction(transactionData) {
        const amount = transactionData.total ?? transactionData.amount;

        if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
            throw new Error('Le montant de la transaction doit être supérieur à zéro');
        }

        if (!transactionData.type || !['ACHAT', 'LOYER', 'RECHARGE'].includes(transactionData.type)) {
            throw new Error('Type de transaction invalide. Les types valides sont : ACHAT, LOYER, RECHARGE');
        }
        
        if (!transactionData.userId) {
            throw new Error('L\'ID utilisateur est requis pour créer une transaction');
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
            throw new Error('Transaction introuvable');
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

    // Récupérer les transactions LOYER filtrées par année et mois
    async getLoyerByYearMonth(year, month) {
        const y = parseInt(year, 10);
        const m = parseInt(month, 10);

        if (!year || isNaN(y) || y < 2000 || y > 2100) {
            throw new Error('Année invalide. Fournir une année entre 2000 et 2100.');
        }
        if (!month || isNaN(m) || m < 1 || m > 12) {
            throw new Error('Mois invalide. Fournir un mois entre 1 et 12.');
        }

        return await transactionRepository.findLoyerByYearMonth(y, m);
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