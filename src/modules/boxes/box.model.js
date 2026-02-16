const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            require: true
        },
        state: {
            type: String,
            enum: ['AVAILABLE', 'RENTED', 'REPAIR'],
            default: 'AVAILABLE',
        },
        rent: {
            type: Number,
            require: true
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: false
        }
    },
    {
        timestamps: true
    }
)

const Box = mongoose.model('Box', boxSchema); // nom du modèle = Box
module.exports = Box;