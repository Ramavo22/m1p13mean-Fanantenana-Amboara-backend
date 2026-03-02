const Coupon = require('./coupon.model');

class CouponRepository {

  async create(data) {
    const coupon = new Coupon(data);
    return await coupon.save();
  }

  async findAll(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(filter),
    ]);

    return {
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findAllActive(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const activeFilter = { ...filter, expiresAt: { $gte: new Date() } };
    const [coupons, total] = await Promise.all([
      Coupon.find(activeFilter)
        .select('-users')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Coupon.countDocuments(activeFilter),
    ]);

    return {
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return await Coupon.findById(id);
  }

  async findByCode(code) {
    return await Coupon.findOne({ code });
  }

  async update(id, data) {
    return await Coupon.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Coupon.findByIdAndDelete(id);
  }

}

module.exports = new CouponRepository();