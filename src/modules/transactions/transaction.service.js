const transactionRepository = require('./transaction.repository');

class TransactionService {
    // Créer une nouvelle transaction
    async createTransaction(transactionData) {
        if (transactionData.amount <= 0) {
            throw new Error('Le montant de la transaction doit être supérieur à zéro');
        }

        if (!transactionData.type || !['ACHAT', 'LOYER', 'RECHARGE'].includes(transactionData.type)) {
            throw new Error('Type de transaction invalide');
        }
        
        if (!transactionData.userId) {
            throw new Error('L\'ID de l\'utilisateur est requis pour créer une transaction');
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

    // Récupérer toutes les transactions d'un utilisateur
    async getTransactionsByUserId(userId, page = 1, limit = 10) {
        return await transactionRepository.findByUserId(userId, page, limit);
    }

    // Récupérer toutes les transactions
    async getAllTransactions(page = 1, limit = 10) {
        return await transactionRepository.findAll(page, limit);
    }
}

module.exports = new TransactionService();