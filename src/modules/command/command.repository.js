const Command = require('./command.model');

class CommandRepository {
  async create(data) {
    const command = new Command(data);
    return command.save();
  }

  async findAll(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    if (filter.boutiqueId) query['boutique._id'] = filter.boutiqueId;
    if (filter.acheteurId) query['acheteur._id'] = filter.acheteurId;

    const [data, total] = await Promise.all([
      Command.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Command.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return Command.findById(id);
  }

  async findByTransactionId(transactionId) {
    return Command.findOne({ transactionId });
  }

  async findByBoutique(boutiqueId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { 'boutique._id': boutiqueId };

    const [data, total] = await Promise.all([
      Command.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Command.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteById(id) {
    return Command.findByIdAndDelete(id);
  }

  async sumNetSalesByBoutiqueAndYear(boutiqueId, year) {
    const yearStart = new Date(year, 0, 1);
    const nextYearStart = new Date(year + 1, 0, 1);

    const [totalResult, byMonthRaw] = await Promise.all([
      Command.aggregate([
        {
          $match: {
            'boutique._id': boutiqueId,
            createdAt: { $gte: yearStart, $lt: nextYearStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]),
      Command.aggregate([
        {
          $match: {
            'boutique._id': boutiqueId,
            createdAt: { $gte: yearStart, $lt: nextYearStart },
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            total: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      total: totalResult[0]?.total || 0,
      byMonthRaw,
    };
  }

  async sumNetSalesTodayByBoutique(boutiqueId) {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const result = await Command.aggregate([
      {
        $match: {
          'boutique._id': boutiqueId,
          createdAt: { $gte: dayStart, $lt: dayEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      date: dayStart.toISOString().split('T')[0],
      total: result[0]?.total || 0,
      orders: result[0]?.count || 0,
    };
  }

  async getDistinctBuyersByBoutique(boutiqueId) {
    const result = await Command.distinct('acheteur._id', { 'boutique._id': boutiqueId });
    return result.length;
  }

  async getMonthlyCustomersByBoutique(boutiqueId, year) {
    const yearStart = new Date(year, 0, 1);
    const nextYearStart = new Date(year + 1, 0, 1);

    return Command.aggregate([
      {
        $match: {
          'boutique._id': boutiqueId,
          createdAt: { $gte: yearStart, $lt: nextYearStart },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          buyers: { $addToSet: '$acheteur._id' },
        },
      },
      {
        $project: {
          _id: 1,
          total: { $size: '$buyers' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

module.exports = new CommandRepository();
