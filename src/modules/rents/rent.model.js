const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema(
    {
        boxId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Box',
            required: true
        },
        shopId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        nextDeadline: {
            type: Date,
            required: true
        },
        status : {
            type : String,
            enum : ['ACTIVE', 'EXPIRED', 'CANCELLED'],
            default: 'ACTIVE'
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        frequency: {
            type: String,
            enum: ['WEEKLY', 'MONTHLY', 'YEARLY'],
            required: true,
            default: 'MONTHLY'
        }
    }
);

// Empecher les locations actives en double pour une même box
rentSchema.index({ boxId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'ACTIVE' } }); 
// Retard de loyer
rentSchema.index({ status: 1, nextDeadline: 1 });


const Rent = mongoose.model('Rent', rentSchema);
module.exports = Rent;