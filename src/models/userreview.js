const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },

    from: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
  }
);

const users = model("userreview", reviewSchema);
module.exports = users;
