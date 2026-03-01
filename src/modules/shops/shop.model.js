const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema(
  {
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
    boxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Box',
      required: false
    },
    photoUrl: {
      type: String,
      required: false,
      default: null
    },
    photoPath: {
      type: String,
      required: false,
      default: null
    }
  },
  { timestamps: true }
);


const Shop = mongoose.model('Shop', ShopSchema);
module.exports = Shop;
