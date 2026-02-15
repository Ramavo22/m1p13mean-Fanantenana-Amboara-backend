const ProductType = require('./product-type.model');

class ProductTypeRepository {

  async create(data) {
    const productType = new ProductType(data);
    return await productType.save();
  }

  async findAll() {
    return await ProductType.find();
  }

  async findById(id) {
    return await ProductType.findById(id);
  }

  async update(id, data) {
    return await ProductType.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await ProductType.findByIdAndDelete(id);
  }

}

module.exports = new ProductTypeRepository();
