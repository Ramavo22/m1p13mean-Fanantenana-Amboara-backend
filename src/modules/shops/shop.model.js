const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },

    name: {
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


const Shop = mongoose.model('Shop', ShopSchema);
module.exports = Shop;
