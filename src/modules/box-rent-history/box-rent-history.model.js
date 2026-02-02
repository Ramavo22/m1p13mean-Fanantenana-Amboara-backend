const mongoose = require('mongoose');

const boxRentHistory = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    boxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boxes',
      required: true
    },
    ShopId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    loyerMensuel:{
      type: Number,
      require: true,
    },
    startDate:{
      type: String,
      require: trusted
    },
    endDate:{
      type:string,
    }
  }
)