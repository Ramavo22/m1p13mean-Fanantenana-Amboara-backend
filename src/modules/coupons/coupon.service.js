const couponRepository = require('./coupon.repository');
const { generateCouponId } = require('../../utils/utils.generator');
const shopService = require('../shops/shop.service');
const productRepository = require('../products/product.repository');

class CouponService {
  async createCoupon(data, userId = null) {
    delete data._id;
    data._id = await generateCouponId();

    if (!data.code) {
      throw new Error("Coupon code is required");
    }
    const existingCoupon = await couponRepository.findByCode(data.code);
    if (existingCoupon) {
      throw new Error("Coupon code already exists");
    }

    const shop = await shopService.getUserShopInfo(userId);
    if (!shop) {
      throw new Error("Shop not found for the connected user");
    }
    data.boutiqueId = shop._id;

    if (data.percentage === undefined || data.percentage === null) {
      throw new Error("Percentage is required");
    }

    if (Number(data.percentage) < 1 || Number(data.percentage) > 100) {
      throw new Error("Percentage must be between 1 and 100");
    }

    if (!data.expiresAt || Number.isNaN(new Date(data.expiresAt).getTime())) {
      throw new Error("A valid expiration date is required");
    }

    if (!["PACK", "SINGLE"].includes(data.type)) {
      throw new Error("Type must be PACK or SINGLE");
    }

    if (
      !data.items ||
      (!Array.isArray(data.items) && data.items.length === 0)
    ) {
      throw new Error("Items are required and must be an array");
    }

    data.code = String(data.code).toUpperCase().trim();
    data.users = Array.isArray(data.users) ? data.users : [];

    return await couponRepository.create(data);
  }

  async getAllCoupons(filter = {}, page = 1, limit = 10) {
    return await couponRepository.findAll(filter, page, limit);
  }

  async getActiveCoupons(page = 1, limit = 10) {
    return await couponRepository.findAllActive({}, page, limit);
  }

  async getCouponsForConnectedUser(userId, role, page = 1, limit = 10) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!role) {
      throw new Error("User role is required");
    }

    if (role === "BOUTIQUE") {
      const shop = await shopService.getUserShopInfo(userId);
      if (!shop) {
        throw new Error("Shop not found for the connected user");
      }
      return await couponRepository.findAll(
        { boutiqueId: shop._id },
        page,
        limit
      );
    }

    if (role === "ACHETEUR") {
      return await couponRepository.findAll(
        { "users._id": userId },
        page,
        limit
      );
    }

    throw new Error("Role not allowed for this resource");
  }

  async getCouponById(id) {
    const coupon = await couponRepository.findById(id);

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    return coupon;
  }

  /**
   * Récupère un coupon avec ses items enrichis des données produit complètes.
   * Exclut le champ `users` de la réponse.
   * Chaque item contient toutes les propriétés nécessaires au product-card.
   */
  async getCouponDetails(id) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    const productIds = coupon.items.map(item => item._id);
    const products = await productRepository.findAll({ _id: { $in: productIds } });

    const productsMap = new Map(products.map(p => [p._id, p]));

    const enrichedItems = coupon.items
      .map(item => {
        const product = productsMap.get(item._id);
        if (!product) return null;
        return {
          _id: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          shop: product.shop,
          attributes: product.attributes,
          promotion: product.promotion,
          photoUrl: product.photoUrl || null,
          productTypeId: product.productTypeId,
          status: product.status,
        };
      })
      .filter(Boolean);

    const couponObj = coupon.toObject ? coupon.toObject() : { ...coupon };
    delete couponObj.users;

    return {
      ...couponObj,
      items: enrichedItems,
    };
  }

  async updateCoupon(id, data) {
    if (data.code) {
      data.code = String(data.code).toUpperCase().trim();
      const existingCoupon = await couponRepository.findByCode(data.code);
      if (existingCoupon && existingCoupon._id !== id) {
        throw new Error("Coupon code already exists");
      }
    }

    if (data.type && !["PACK", "SINGLE"].includes(data.type)) {
      throw new Error("Type must be PACK or SINGLE");
    }

    if (
      data.percentage !== undefined &&
      (Number(data.percentage) < 1 || Number(data.percentage) > 100)
    ) {
      throw new Error("Percentage must be between 1 and 100");
    }

    if (
      data.expiresAt !== undefined &&
      Number.isNaN(new Date(data.expiresAt).getTime())
    ) {
      throw new Error("A valid expiration date is required");
    }

    if (data.users !== undefined && !Array.isArray(data.users)) {
      throw new Error("Users must be an array");
    }

    if (data.items !== undefined && !Array.isArray(data.items)) {
      throw new Error("Items must be an array");
    }

    if (data.type === "SINGLE" && data.users && data.users.length === 0) {
      throw new Error("Users are required when coupon type is SINGLE");
    }

    delete data._id;
    const coupon = await couponRepository.update(id, data);

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    return coupon;
  }

  async deleteCoupon(id) {
    const coupon = await couponRepository.delete(id);

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    return coupon;
  }

  async validateCoupon(code, userId) {
    const coupon = await couponRepository.findByCode(
      String(code).toUpperCase().trim()
    );

    if (!coupon) {
      throw new Error("This coupon does not exist");
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      throw new Error("This coupon has expired");
    }

    if (coupon.users && coupon.users.some((u) => u._id === userId)) {
      throw new Error("You already used this coupon");
    }

    return coupon;
  }

  async _validateCoupon(couponId, acheteurId) {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon) {
      throw new Error("Coupon introuvable");
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      throw new Error("Ce coupon a expiré");
    }

    if (coupon.users && coupon.users.some((u) => u._id === acheteurId)) {
      throw new Error("Vous avez déjà utilisé ce coupon");
    }

    if (!coupon.items || coupon.items.length === 0) {
      throw new Error("Ce coupon ne contient aucun produit éligible");
    }

    return coupon;
  }

  async markCouponAsUsed(couponId, userId) {
    return couponRepository.update(couponId, {
      $push: {
        users: {
          _id: userId,
          usedAt: new Date(),
        },
      },
    });
  }

  async unmarkCouponUsage(couponId, userId) {
    return couponRepository.update(couponId, {
      $pull: {
        users: {
          _id: userId,
        },
      },
    });
  }

  async formatCoupon(coupon){
    return {
        _id: coupon._id,
        code: coupon.code,
        percentage: coupon.percentage,
        expiresAt: coupon.expiresAt,
        type: coupon.type,
        items: coupon.items,
        boutiqueId: coupon.boutiqueId
    }
  }
}

module.exports = new CouponService();