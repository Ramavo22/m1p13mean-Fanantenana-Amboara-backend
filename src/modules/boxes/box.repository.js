const Box = require('./box.model');

class BoxRepository {

  async create(data) {
    const box = new Box(data);
    return box.save();
  }

  async findAll() {
    return Box.find();
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
