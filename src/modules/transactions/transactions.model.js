const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['ACHAT', 'RECHARGE', 'LOYER'],
        required: true,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rent',
    },
    panierId: {
        type: String,
        ref: 'Panier',
        default: null,
    },
    periode: {
        type: String,
    },
});

// Empêcher les paiements en double pour une même location et période
transactionSchema.index({userId: 1, rentId: 1, periode: 1, type: 1 }, { unique: true, partialFilterExpression: { type: 'LOYER' } });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;