const userModel = require("../models/userSchema");
const channelModel = require("../models/channelSchema");
const interest = require("../models/interest");
require("../models/interest");
exports.getChannelCount = async function (req, res) {
  try {
    const channel = await channelModel.count();
    res.json(channel);
  } catch (error) {
    res.status(404).send(error);
  }
};
exports.getAllChannels = async function (req, res) {
  try {
    const channels = await channelModel.find().populate("interests");

    res.json(channels);
  } catch (error) {
    res.status(404).send(error + " j");
  }
};

exports.getChannelById = async function (req, res) {
  try {
    const channel = await channelModel
      .findOne({ _id: req.params.id })
      .populate("rooms")
      .populate("interests");
    res.json(channel);
  } catch (error) {
    res.status(404).send(error);
  }
};

exports.updateChannel = async function (req, res) {
  try {
    await channelModel.updateOne({ _id: req.params.id }, { $set: req.body });

    res.json("Updated channel successfully");
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
};

//join club
exports.subscribeToChannel = async function (req, res) {
  try {
    const userId = req.body.uid;
    const channelId = req.params.channelId;

    await channelModel.updateOne(
      { _id: channelId },
      { $addToSet: { members: req.body.uid } }
    );

    await userModel.updateOne(
      { _id: userId },
      { $addToSet: { channels: req.params.channelId } }
    );

    res.json("Subscribed to channel successfully");
  } catch (err) {
    console.log(err + " ");
    res.status(404).send(err);
  }
};

exports.unSubscribeFromChannel = async function (req, res) { 
  try {
    const myid = req.body.uid;
    const channelId = req.params.channelId;

    const channel = await channelModel.findOne({ _id: channelId });

    await userModel.updateOne(
      { _id: myid },
      { $pullAll: { interest: [channelId] } }
    );

    await channelModel.updateOne(
      { _id: channelId },
      { $pullAll: { members: [myid] } }
    );

    res.json("Left club successfully");
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
};

exports.addRoom = async function (req, res) {
  try {
    const channelId = req.params.clubid;

    await channelModel.updateOne(
      { _id: channelId },
      { $addToSet: { rooms: [req.body.roomid] } }
    );

    res.json("Added Room successfully");
  } catch (err) {
    res.status(404).send(err);
  }
};

exports.removeRoom = async function (req, res) {
  try {
    const channelId = req.params.channelId;

    await channelModel.updateOne(
      { _id: channelId },
      { $pullAll: { rooms: [req.body.roomid] } }
    );

    res.json("Removed Room successfully");
  } catch (err) {
    res.status(404).send(err);
  }
};
exports.deleteChannel = async function (req, res) {
  try {
    await channelModel.deleteOne({ _id: req.params.id });
    await interest.deleteOne({ channel: req.params.id });

    res.json("Successfuly deleted club");
  } catch (err) {
    res.status(404).send(err);
  }
};

exports.saveChannel = async function (req, res) {
  const channel = new channelModel(req.body);

  try {
    var results = await channel.save();
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(400).send({ success: false, message: err });
  }
};
