const couponRepository = require('./coupon.repository');
const { generateCouponId } = require('../../utils/utils.generator');
const shopService = require('../shops/shop.service');
const productRepository = require('../products/product.repository');

class CouponService {
  async createCoupon(data, userId = null) {
    delete data._id;
    data._id = await generateCouponId();

    if (!data.code) {
      throw new Error("Le code du coupon est obligatoire");
    }
    const existingCoupon = await couponRepository.findByCode(data.code);
    if (existingCoupon) {
      throw new Error("Ce code de coupon existe déjà");
    }

    const shop = await shopService.getUserShopInfo(userId);
    if (!shop) {
      throw new Error("Aucune boutique trouvée pour l'utilisateur connecté");
    }
    data.boutiqueId = shop._id;

    if (data.percentage === undefined || data.percentage === null) {
      throw new Error("Le pourcentage est obligatoire");
    }

    if (Number(data.percentage) < 1 || Number(data.percentage) > 100) {
      throw new Error("Le pourcentage doit être compris entre 1 et 100");
    }

    if (!data.expiresAt || Number.isNaN(new Date(data.expiresAt).getTime())) {
      throw new Error("Une date d'expiration valide est requise");
    }

    if (!["PACK", "SINGLE"].includes(data.type)) {
      throw new Error("Le type doit être PACK ou SINGLE");
    }

    if (
      !data.items ||
      (!Array.isArray(data.items) || data.items.length === 0)
    ) {
      throw new Error("Les articles sont obligatoires et doivent être un tableau");
    }

    data.code = String(data.code).toUpperCase().trim();
    data.users = Array.isArray(data.users) ? data.users : [];

    return await couponRepository.create(data);
  }

  async getAllCoupons(filter = {}, page = 1, limit = 10) {
    return await couponRepository.findAll(filter, page, limit);
  }

  _buildCouponFilters(filters = {}) {
    const builtFilter = {};

    if (filters.type) {
      const normalizedType = String(filters.type).toUpperCase().trim();
        if (!['PACK', 'SINGLE'].includes(normalizedType)) {
            throw new Error('Le type doit être PACK, SINGLE ou ALL');
        }
        builtFilter.type = normalizedType;
    }

    if (filters.status) {
      const normalizedExpiration = String(filters.status).toLowerCase().trim();
        if (normalizedExpiration === 'active') {
            builtFilter.expiresAt = { $gte: new Date() };
        } else if (normalizedExpiration === 'expired') {
            builtFilter.expiresAt = { $lt: new Date() };
        } else {
            throw new Error('Le statut doit être active ou expired');
        }
    }

    return builtFilter;
  }

  async getFilteredCoupons(filters = {}, page = 1, limit = 10) {
    const filter = this._buildCouponFilters(filters);

    return await couponRepository.findAll(filter, page, limit);
  }

  async getActiveCoupons(page = 1, limit = 10) {
    return await couponRepository.findAllActive({}, page, limit);
  }

  async getCouponsForConnectedUser(userId, role, filters = {}, page = 1, limit = 10) {
    if (!userId) {
      throw new Error("L'ID utilisateur est obligatoire");
    }

    if (!role) {
      throw new Error("Le rôle utilisateur est obligatoire");
    }

    const commonFilters = this._buildCouponFilters(filters);

    if (role === "BOUTIQUE") {
      const shop = await shopService.getUserShopInfo(userId);
      if (!shop) {
        throw new Error("Aucune boutique trouvée pour l'utilisateur connecté");
      }
      return await couponRepository.findAll(
        { boutiqueId: shop._id, ...commonFilters },
        page,
        limit
      );
    }

    if (role === "ACHETEUR") {
      return await couponRepository.findAll(
        { "users._id": userId, ...commonFilters },
        page,
        limit
      );
    }

    throw new Error("Rôle non autorisé pour cette ressource");
  }

  async getCouponById(id) {
    const coupon = await couponRepository.findById(id);

    if (!coupon) {
      throw new Error("Coupon introuvable");
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
      throw new Error('Coupon introuvable');
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
        throw new Error("Ce code de coupon existe déjà");
      }
    }

    if (data.type && !["PACK", "SINGLE"].includes(data.type)) {
      throw new Error("Le type doit être PACK ou SINGLE");
    }

    if (
      data.percentage !== undefined &&
      (Number(data.percentage) < 1 || Number(data.percentage) > 100)
    ) {
      throw new Error("Le pourcentage doit être compris entre 1 et 100");
    }

    if (
      data.expiresAt !== undefined &&
      Number.isNaN(new Date(data.expiresAt).getTime())
    ) {
      throw new Error("Une date d'expiration valide est requise");
    }

    if (data.users !== undefined && !Array.isArray(data.users)) {
      throw new Error("Les utilisateurs doivent être un tableau");
    }

    if (data.items !== undefined && !Array.isArray(data.items)) {
      throw new Error("Les articles doivent être un tableau");
    }

    if (data.type === "SINGLE" && data.users && data.users.length === 0) {
      throw new Error("Les utilisateurs sont obligatoires quand le type du coupon est SINGLE");
    }

    delete data._id;
    const coupon = await couponRepository.update(id, data);

    if (!coupon) {
      throw new Error("Coupon introuvable");
    }

    return coupon;
  }

  async deleteCoupon(id) {
    const coupon = await couponRepository.delete(id);

    if (!coupon) {
      throw new Error("Coupon introuvable");
    }

    return coupon;
  }

  async validateCoupon(code, userId) {
    const coupon = await couponRepository.findByCode(
      String(code).toUpperCase().trim()
    );

    if (!coupon) {
      throw new Error("Ce coupon n'existe pas");
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      throw new Error("Ce coupon a expiré");
    }

    if (coupon.users && coupon.users.some((u) => u._id === userId)) {
      throw new Error("Vous avez déjà utilisé ce coupon");
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