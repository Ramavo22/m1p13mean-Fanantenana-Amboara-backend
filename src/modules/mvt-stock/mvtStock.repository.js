const MvtStock = require('./mvtStock.model');

class MvtStockRepository {
  async create(data) {
    const movement = new MvtStock(data);
    return movement.save();
  }

  async findAll(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    if (filter.produitId) {
      query.produitId = filter.produitId;
    }

    if (filter.reason) {
      query.reason = filter.reason;
    }

    const [movements, total] = await Promise.all([
      MvtStock.find(query).skip(skip).limit(limit),
      MvtStock.countDocuments(query)
    ]);

    return {
      data: movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new MvtStockRepository();