const ProductType = require('./product-type.model');

class ProductTypeRepository {

  async findProductTypeForSelect(){
    return await ProductType.find().select('_id label attributes');
  }

  async create(data) {
    const productType = new ProductType(data);
    return await productType.save();
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [productTypes, total] = await Promise.all([
      ProductType.find().skip(skip).limit(limit),
      ProductType.countDocuments(),
    ]);

    return {
      data: productTypes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
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
