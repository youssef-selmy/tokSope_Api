const shopModel = require("../models/shopSchema");
const userModel = require("../models/userSchema");
var productModel = require("../models/productSchema");
var mongoose = require("mongoose");
const functions = require("../shared/functions");
var ObjectId = require("mongodb").ObjectID;

exports.getAllShopsPaginated = async (req, res) => {
  try {
    const { title, page, limit } = req.query;

    const queryObject = {};

    if (title) {
      queryObject.$or = [{ name: { $regex: `${title}`, $options: "i" } }];
    }
    const pages = Number(page);
    const limits = Number(limit);
    const skip = (pages - 1) * limits;

    try {
      const totalDoc = await shopModel.countDocuments(queryObject);
      const shops = await shopModel
        .find(queryObject)
        .sort({ _id: -1 })
        .skip(skip)
        .populate("userId", ["userName", "followers", "following"])
        .populate("interest")
        .limit(limits);

      res.send({
        shops,
        totalDoc,
        limits,
        pages,
      });
    } catch (err) {
      res.status(500).send({
        message: err.message,
      });
    }
  } catch (error) {
    console.log(error + " ");
    res.statusCode = 422;
    res.setHeader("Content-Type", "application/json");
    res.json(error);
  }
};

exports.getAllShopsByUserId = async (req, res) => {
  try {
    let shops = await shopModel
      .findOne({ userId: req.params.userId })
      .populate("userId", [
        "firstName",
        "lastName",
        "bio",
        "userName",
        "email",
        "followers",
        "following",
      ])
      .sort({ createdAt: -1 });
    res.status(200).setHeader("Content-Type", "application/json").json(shops);
  } catch (error) {
    res
      .status(422)
      .setHeader("Content-Type", "application/json")
      .json(error.message);
  }
};

exports.searchForShop= async (req, res) => {
	
  try {
    const title = req.params.name;
    var page = req.params.pagenumber;
    var limit = 15;
    const queryObject = {};

    if (title) {
      queryObject.$or = [{ name: { $regex: `${title}`, $options: "i" } }];
    }
      
    
    const pages = Number(page);
    const limits = Number(limit);
    const skip = (pages - 1) * limits;
    try {
      const totalDoc = await shopModel.countDocuments(queryObject);
      const brands = await shopModel
        .find(queryObject)
        .sort({ _id: -1 })
        .skip(skip)
        .populate("userId", [
          "followers"
        ])
        .limit(limits);

      res.send  ({
        brands,
        totalDoc,
        limits,
        pages,
      });
    } catch (err) {
      res.status(500).send({
        message: err.message, 
      }); 
    }
  } catch (error) {
    console.log(error + " ");
    res.statusCode = 422;
    res.setHeader("Content-Type", "application/json");
    res.json(error);
  }
};

exports.getShippingMethods = async (req, res) => {
  try {
    let data = await shopModel.find({ _id: req.params.id });

    res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .json({ success: true, data });
  } catch (error) {
    if (error.code === 11000) res.status(409);
    else res.status(422);
    res
      .setHeader("Content-Type", "application/json")
      .json({ success: false, message: error.message });
  }
};

exports.addShippingMethood = async (req, res) => {
  try {
    let updatedShop = await shopModel.findByIdAndUpdate(
      req.params.id,
      {
        shippingMethods: req.body.data,
      },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .json({ success: true, updatedShop });
  } catch (error) {
    if (error.code === 11000) res.status(409);
    else res.status(422);
    res
      .setHeader("Content-Type", "application/json")
      .json({ success: false, message: error.message });
  }
};

exports.createShop = async (req, res) => {
  const newShop = {
    name: req.body.name,
    image: req.body.image,
    ownerId: req.body.ownerId,
    interest: req.body.interest,
    userId: mongoose.mongo.ObjectId(req.params.userId),
  };

  try {
    var account;
    if (process.env.DEMO) {
      account = await functions.stripeConnect(
        {},
        req.params.userId,
        req.body.first_name,
        req.body.last_name,
        req.body.email
      );
    }

    let brandNew = await shopModel.create(newShop);
    await userModel.findByIdAndUpdate(req.params.userId, {
      $set: { shopId: mongoose.mongo.ObjectId(brandNew._id) },
    });
    res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .json({ success: true, data: brandNew, account });
  } catch (error) {
    if (error.code === 11000) res.status(409);
    else res.status(422);
    res
      .setHeader("Content-Type", "application/json")
      .json({ success: false, message: error.message });
  }
};

exports.getShopById = async (req, res) => {
  try {
    let shop = await shopModel
      .findById(req.params.shopId)
      .populate("interest")
      .populate("userId", [
        "firstName",
        "lastName",
        "bio",
        "userName",
        "email",
        "followers",
        "following",
      ]);
    res.status(200).setHeader("Content-Type", "application/json").json(shop);
  } catch (error) {
    res
      .status(422)
      .setHeader("Content-Type", "application/json")
      .json(error.message);
  }
};

//keep the image name consistent through all updates and remember to  save in the files
exports.updateShopById = async (req, res) => {
  let newObj = req.body;
  console.log(newObj)
  try {
    let updatedShop = await shopModel.findByIdAndUpdate(
      req.params.shopId,
      {
        $set: newObj,
      },
      { new: true, runValidators: true }
    );
    if (req.body.open == false) {
      await productModel.updateMany(
        { shopId: ObjectId(req.params.shopId) },
        { $set: { available: false } },
        { multi: true }
      );
    }

    if (req.body.open == true) {
      await productModel.updateMany(
        { shopId: ObjectId(req.params.shopId) },
        { $set: { available: true } },
        { multi: true }
      );
    }

    res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .json({ success: true, data: updatedShop });
  } catch (e) {
    res
      .status(422)
      .setHeader("Content-Type", "application/json")
      .json({ success: false, message: e.message });
  }
};

exports.deleteShopById = async (req, res) => {
  try {
    let del = await shopModel.findByIdAndDelete(req.params.shopId);
    res.status(200).setHeader("Content-Type", "application/json").json(del);
  } catch (error) {
    res
      .status(422)
      .setHeader("Content-Type", "application/json")
      .json(error.message);
  }
};
