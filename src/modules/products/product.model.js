const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },

    nom: {
      type: String,
      required: true,
      index: true
    },

    prix: {
      type: Number,
      required: true,
      min: 0
    },

    typeProduitId: {
      type: String,
      required: true,
      ref: 'ProductType'
    },

    boutique: {
      _id: {
        type: String,
        required: true
      },
      nom: {
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

productSchema.index({ typeProduitId: 1 });
productSchema.index({ 'attributes.MARQUE': 1 });

module.exports = mongoose.model('Product', productSchema);
