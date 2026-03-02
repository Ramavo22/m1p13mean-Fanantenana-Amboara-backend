const couponService = require('./coupon.service');

class CouponController {

  async create(req, res) {
    try {
      const userId = req.user?.sub;
      const coupon = await couponService.createCoupon(req.body, userId);

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const result = await couponService.getAllCoupons({}, page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getActive(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const result = await couponService.getActiveCoupons(page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyCoupons(req, res) {
    try {
      const userId = req.user?.sub;
      const role = req.user?.role;
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

      const result = await couponService.getCouponsForConnectedUser(userId, role, page, limit);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      const statusCode = error.message === 'Role not allowed for this resource' ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getValidCouponByCode(req, res) {
    try {
      const userId = req.user?.sub;
      const couponCode = req.params.code;

      const result = await couponService.validateCoupon(couponCode, userId);
      const formattedCoupon = await couponService.formatCoupon(result);

      return res.status(200).json({
        success: true,
        data: formattedCoupon,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const coupon = await couponService.getCouponById(req.params.id);

      return res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDetails(req, res) {
    try {
      const couponDetail = await couponService.getCouponDetails(req.params.id);

      return res.status(200).json({
        success: true,
        data: couponDetail,
      });
    } catch (error) {
      const statusCode = error.message === 'Coupon not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
      });
    } catch (error) {
      const statusCode = error.message === 'Coupon not found' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      await couponService.deleteCoupon(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

}

module.exports = new CouponController();