const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const shopSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      default: "",
    },
    shopifyAccessToken: {
      type: String,
      default: "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",
    },
    shopifyUrl: {
      type: String,
      default: "https://tokshop-liveshopping.myshopify.com/admin/api/2022-07/",
    },
    shopifyLastDate: { type: String, default: "" },

    wcSecretKey: {
      type: String,
      default: "cs_80734d3a1465c72721d381d71cc444500d5caa9d",
    },
    wcConsumerKey: {
      type: String,
      default: "ck_389e4950dcd37edadf12260bf043cbb9eceea5aa",
    },
    wcUrl: {
      type: String,
      default: "https://sunpay.co.ke/wp/wp-json/wc/v3/",
    },
    wcIDs: { type: Array, default: [] },
    interest: [
      {
        type: Schema.Types.ObjectId,
        ref: "interest",
      },
    ],
    paymentOptions: {
      type: Array,
      default: ["cc", "cod"],
    },
    shippingMethods: {
      type: Array,
      default: [{ name: "Free", amount: 0, enabled: true }],
    },

    image: {
      type: String,
    },
    description: {
      type: String,
    },
    ownerId: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    open: {
      type: Boolean,
      default: true,
    },
    allowWcimport: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, autoCreate: true, autoIndex: true }
);

shopSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next({ success: false, message: "There is a shop with that name" });
  } else {
    next();
  }
});
const shops = model("shop", shopSchema);

module.exports = shops;
