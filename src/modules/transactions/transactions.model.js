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
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;