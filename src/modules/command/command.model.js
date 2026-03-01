const mongoose = require('mongoose');

const commandItemProduitSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qte: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const commandItemSchema = new mongoose.Schema(
  {
    produit: {
      type: commandItemProduitSchema,
      required: true,
    },
  },
  { _id: false }
);

const commandSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    acheteur: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
    },
    boutique: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
    },
    transactionId: {
      type: String,
      required: true,
      ref: 'Transaction',
    },
    items: {
      type: [commandItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Command', commandSchema);
