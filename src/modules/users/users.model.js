const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['ADMIN', 'BOUTIQUE', 'ACHETEUR'],
      required: true,
      default: 'ACHETEUR',
    },
    login: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profile: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      tel: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/,
      },
      solde: {
        type: Number,
        default: 0,
        min: 0,
      },
      email: {
        type: String,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Index sur le login pour les recherches rapides
userSchema.index({ 'profile.email': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
