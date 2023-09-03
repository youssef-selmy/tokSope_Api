const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const bidSchema = new Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    
    user:
      {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    auction:
      {
        type: Schema.Types.ObjectId,
        ref: "auction",
    },
  },
  { timestamps: true, autoCreate: true, autoIndex: true }
);

const bidModel = model("bids", bidSchema); 

module.exports = bidModel;
  