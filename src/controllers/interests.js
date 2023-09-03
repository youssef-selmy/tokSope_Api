const channelModel = require("../models/channelSchema");
const interestModel = require("../models/interest");

//Delete club
exports.deleteInterest = async function (req, res) {
  try {
    await interestModel.deleteOne({ _id: req.params.id });

    res.json("Successfuly deleted sInterest");
  } catch (err) {
    res.status(404).send(err);
  }
};

exports.getInterestsById = async function (req, res) {
  try {
    const interests = await interestModel.find({ _id: req.params.id });

    res.json(interests[0]);
  } catch (error) {
    console.log(error);
    res.status(404).send(error + " j");
  }
};
exports.getInterests = async function (req, res) {
  try {
    const interests = await interestModel.find({ channel: req.params.id });

    res.json(interests);
  } catch (error) {
    res.status(404).send(error + " j");
  } 
};
exports.saveInterest = async function (req, res) {
  console.log(req.body);
  const interest = new interestModel(req.body);

  try {
    var results = await interest.save();
    await channelModel.findByIdAndUpdate(req.body["channel"], {
      $addToSet: { interests: results._id },
    });
    res.json({ success: true, data: results });
  } catch (err) {
  console.log(err); 
    res.status(400).send({ success: false, message: err });
  }
};
exports.updateInterest = async function (req, res) {
  try {
    await interestModel.updateOne({ _id: req.params.id }, { $set: req.body });
    res.json("Updated interest successfully");
  } catch (err) {
    res.status(404).send(err);
  }
};
