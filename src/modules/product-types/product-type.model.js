const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    type: {
      type: String,
      required: true,
      enum: ['ENUM', 'NUMBER', 'STRING', 'BOOLEAN', 'DATE']
    },

    values: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return this.type !== 'ENUM' || v.length > 0;
        },
        message: 'les valeurs sont obligatoires quand le type est ENUM'
      }
    },

    min: {
      type: Number,
      validate: {
        validator: function (v) {
          return this.type !== 'NUMBER' || v !== undefined;
        },
        message: 'min est uniquement autorisé pour le type NUMBER'
      }
    },

    max: {
      type: Number,
      validate: {
        validator: function (v) {
          return this.type !== 'NUMBER' || v !== undefined;
        },
        message: 'max est uniquement autorisé pour le type NUMBER'
      }
    }
  },
  { _id: false }
);

const productTypeSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: false
    },

    label: {
      type: String,
      required: true
    },

    attributes: {
      type: [attributeSchema],
      default: [],
      validate: {
        validator: function (attrs) {
          const codes = attrs.map(a => a.code);
          return codes.length === new Set(codes).size;
        },
        message: 'Code d\'attribut en doublon dans le type de produit'
      }
    }
  },
  {
    timestamps: true
  }
);

const ProductType = mongoose.model('ProductType', productTypeSchema);
module.exports = ProductType;
