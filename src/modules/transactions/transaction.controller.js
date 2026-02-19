const transactionService = require('./transaction.service');

class TransactionController {
    // Créer une transaction
    async create(req, res) {
        try {
            const transactionData = req.body;
            const transaction = await transactionService.createTransaction(transactionData);
            return res.status(201).json({
                success: true,
                message: 'Transaction créée avec succès',
                data: transaction,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Erreur lors de la création de la transaction',
            });
        }
    }

    // Récupérer les transactions d'un utilisateur
    async getUserTransactions(req, res) {
        try {
            const filters = {
                userId: req.params.userId,
                type: req.query.type,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const transactions = await transactionService.getTransactionsByUserId(filters, page, limit);
            return res.status(200).json({
                success: true,
                message: 'Transactions récupérées avec succès',
                data: transactions.data,
                pagination: transactions.pagination,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération des transactions',
            });
        }
    }

    // Récupérer toutes les transactions    
    async getAll(req, res) {
        try {
            const filters = {
                type: req.query.type,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const transactions = await transactionService.getAllTransactions(filters, page, limit);
            return res.status(200).json({
                success: true,
                message: 'Transactions récupérées avec succès',
                data: transactions.data,
                pagination: transactions.pagination,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération des transactions',
            });
        }
    }

    // Récupérer une transaction par ID
    async getById(req, res) {
        try {
            const transactionId = req.params.id;
            const transaction = await transactionService.getTransactionById(transactionId);
            return res.status(200).json({
                success: true,
                message: 'Transaction récupérée avec succès',
                data: transaction,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération de la transaction',
            });
        }

    }
}

module.exports = new TransactionController();