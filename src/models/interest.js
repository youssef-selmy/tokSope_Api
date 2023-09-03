const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const interest = new mongoose.Schema({
  channel: {
    type: Schema.Types.ObjectId,
    ref: "channel",
    default: null,
  },
  name: {
    type: String,
    default: "",
  }, 
});

module.exports = mongoose.model("interest", interest);
