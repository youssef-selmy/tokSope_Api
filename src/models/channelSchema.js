const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const channelSchema = new mongoose.Schema({
  interests: [
    {
      type: Schema.Types.ObjectId,
      ref: "interest",
    },
  ],

  title: {
    type: String,
  },
  imageurl: {
    type: String,
    default: "",
  },
  invited: {
    type: Array,
  },

  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  rooms: [
    {
      type: Schema.Types.ObjectId,
      ref: "rooms",
    },
  ],
});

module.exports = mongoose.model("channel", channelSchema);
