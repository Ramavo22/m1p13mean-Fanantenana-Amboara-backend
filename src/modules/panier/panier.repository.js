const Panier = require('./panier.model');

class PanierRepository {
  async create(data, session = null) {
    const panier = new Panier(data);
    return panier.save(session ? { session } : undefined);
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [paniers, total] = await Promise.all([
      Panier.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Panier.countDocuments(),
    ]);

    return {
      data: paniers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return Panier.findById(id);
  }

  async findPendingByAcheteurId(acheteurId) {
    return Panier.findOne({ acheteurId, etat: 'PENDING' });
  }

  async findByAcheteurId(acheteurId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [paniers, total] = await Promise.all([
      Panier.find({ acheteurId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Panier.countDocuments({ acheteurId }),
    ]);

    return {
      data: paniers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id, data) {
    return Panier.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Panier.findByIdAndDelete(id);
  }
}

module.exports = new PanierRepository();
