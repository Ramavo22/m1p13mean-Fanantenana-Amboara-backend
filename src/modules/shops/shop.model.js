const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },

    nom: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', ShopSchema);
