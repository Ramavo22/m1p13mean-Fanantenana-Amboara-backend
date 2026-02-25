const mongoose = require('mongoose');

const mvtStockSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    produitId: {
      type: String,
      required: true,
      ref: 'Product'
    },
    qte: {
      type: Number,
      required: true,
      min: 0
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      enum: ['VENTE', 'ACHAT'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MvtStock', mvtStockSchema);