const Box = require('./box.model'); // <-- importe le modèle correctement

class BoxRepository {

  async create(data) {
    const box = new Box(data);
    return box.save();
  }

  async findAll({ page = 1, limit = 10, state, search } = {}) {
    const skip = (page - 1) * limit;
    const filter = {};
    if (state) filter.state = state;
    if (search) filter.label = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Box.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Box.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findById(id) {
    return Box.findById(id);
  }

  async update(id, data) {
    return Box.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return Box.findByIdAndDelete(id);
  }
}

module.exports = new BoxRepository();
