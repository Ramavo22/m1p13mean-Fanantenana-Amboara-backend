const ProductType = require('./product-type.model');

class ProductTypeRepository {

  async create(data) {
    const productType = new ProductType(data);
    return productType.save();
  }

  async findAll() {
    return ProductType.find();
  }

  async findById(id) {
    return ProductType.findById(id);
  }

  async update(id, data) {
    return ProductType.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return ProductType.findByIdAndDelete(id);
  }

}

module.exports = new ProductTypeRepository();
