const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true
        },

        label: {
            type: String,
            require: true
        },
        state: {
            type: String,
            enum: ['AVAILABLE','RENTED','REPAIR'],
            default: 'AVAILABLE',
        },
        rent: {
            type: Number,
            require: true
        },
    },
    { 
        timestamps: true 
    }
)

const Boxes = mongoose.model('Boxes',boxSchema);
module.exports = Boxes;