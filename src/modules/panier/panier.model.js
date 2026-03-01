const mongoose = require('mongoose');

const panierItemShopSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, ref: 'Shop' },
    name: { type: String, required: true },
  },
  { _id: false }
);

const panierItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      ref: 'Product',
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    qte: {
      type: Number,
      required: true,
      min: 1,
    },
    shop: {
      type: panierItemShopSchema,
      required: false,
      default: null,
    },
  },
  { _id: false }
);

const panierSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    acheteurId: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [panierItemSchema],
      default: [],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    etat: {
      type: String,
      enum: ['PENDING', 'VALIDATED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Panier = mongoose.model('Panier', panierSchema);

module.exports = Panier;
