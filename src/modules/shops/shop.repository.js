const Shop = require('./shop.model');

class ShopRepository {
    async create(data){
        const shop = new Shop(data);
        return shop.save();
    }

    async findAll(){
        return Shop.find();
    }

    async findById(id){
        return Shop.findById(id);
    }

    async update(id, data){
        return Shop.findByIdAndUpdate(id, data, {new: true});
    }

    async delete(id){
        return Shop.findByIdAndDelete(id);
    }
}

module.exports = new ShopRepository();
