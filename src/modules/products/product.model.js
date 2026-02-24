const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true,
      index: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    productTypeId: {
      type: String,
      required: true,
      ref: 'ProductType'
    },

    shop: {
      _id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },

    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },

    stock: {
      type: Number,
      default: 0,
      min: 0
    },

    promotion: {
      active: {
        type: Boolean,
        default: false
      },
      reduction: {
        type: Number,
        min: 0,
        max: 100
      }
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ productTypeId: 1 });
productSchema.index({ 'attributes.BRAND': 1 });

module.exports = mongoose.model('Product', productSchema);
