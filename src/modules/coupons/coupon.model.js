const mongoose = require('mongoose');

const userCouponSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, ref: 'User' },
    usedAt: { type: Date, required: false, default: null },
  },
  { _id: false }
);

const productCouponSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, ref: 'Product' },
    name: { type: String, required: true },
  },
  { _id: false }
);

const couponSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: false,
			trim: true,
		},
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			uppercase: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		boutiqueId: {
			type: String,
			required: true,
			trim: true,
		},
		percentage: {
			type: Number,
			required: true,
			min: 1,
			max: 100,
		},
		type: {
			type: String,
			enum: ['PACK', 'SINGLE'],
			required: true,
			default: 'SINGLE',
		},
        items: {
            type: [productCouponSchema],
            default: [],
        },
		users: {
			type: [userCouponSchema],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

couponSchema.index({ code: 1 });
couponSchema.index({ boutiqueId: 1, expiresAt: 1 });
couponSchema.index({ users: 1 });
couponSchema.index({ items: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
