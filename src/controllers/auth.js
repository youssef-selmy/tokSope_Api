const userModel = require("../models/userSchema");
const passport = require("passport");
const jwt = require("jsonwebtoken");
var admin = require("firebase-admin");
const serviceAccount = require("../../service_account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin.firestore().settings({ ignoreUndefinedProperties: true });

require("dotenv").config({ path: `${__dirname}/../../.env` });

exports.checUserExistsByEmail = async (req, res, next) => {
  console.log(req.body);
  const user = await userModel.find({ email: req.body.email });
  if (user.length > 0) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
};

exports.mobileLoginRegisterWithSocial = async (req, res, next) => {
  const user = await userModel
    .find({ email: req.body.email })
    .populate("shopId")
    .populate("following", [
      "firstName",
      "lastName",
      "bio",
      "userName",
      "email",
      "accountDisabled",
    ])
    .populate("followers", [
      "firstName",
      "lastName",
      "bio",
      "userName",
      "email",
      "accountDisabled",
    ])
    .populate("defaultpaymentmethod")
    .populate("payoutmethod")
    .populate({
      path: "shopId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "address",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "address",
      populate: {
        path: "userId",
      },
    })
    .populate("channel")
    .populate("interest");
  if (user.length > 0) {
    console.log("one", user[0]);
    admin
      .auth()
      .createCustomToken(user[0]._id.toString())
      .then(async (customToken) => {
        const token = jwt.sign(user[0].email, process.env.secret_key);
        res.status(200).json({
          authtoken: customToken,
          success: true,
          data: user[0],
          accessToken: token,
          newuser: false,
        });
      })
      .catch((error) => {
        res.status(400).json({ success: false });
      });
  } else {
    let added = await userModel.create(req.body);
    added
      .populate("shopId")
      .populate("following", [
        "firstName",
        "lastName",
        "bio",
        "userName",
        "email",
        "accountDisabled",
      ])
      .populate("followers", [
        "firstName",
        "lastName",
        "bio",
        "userName",
        "email",
        "accountDisabled",
      ])
      .populate("defaultpaymentmethod")
      .populate("payoutmethod")
      .populate({
        path: "address",
        populate: {
          path: "userId",
        },
      })
      .populate({
        path: "address",
        populate: {
          path: "userId",
        },
      })
      .populate("channel")
      .populate("interest");
    console.log("added ", added);
    admin
      .auth()
      .createCustomToken(added._id.toString())
      .then(async (customToken) => {
        const token = jwt.sign(added.email, process.env.secret_key);

        res.status(200).json({
          authtoken: customToken,
          success: true,
          data: added,
          accessToken: token,
          newuser: true,
        });
      })
      .catch((error) => {
        res.status(400).json({ success: false });
      });
  }
};
exports.adminLoginWithSocial = async (req, res, next) => {
  const user = await userModel.find({ email: req.body.email });
  if (user.length > 0 && user[0].shopId != null) {
    console.log(user);
    if (req.body.type == "apple" || req.body.type == "google") {
      admin
        .auth()
        .createCustomToken(user[0]._id.toString())
        .then(async (customToken) => {
          const token = jwt.sign(user[0].email, process.env.secret_key);

          res.status(200).json({
            authtoken: customToken,
            success: true,
            data: user[0],
            accessToken: token,
          });
        })
        .catch((error) => {
          res.status(400).json(null);
        });
    } else {
      res
        .status(422)
        .setHeader("Content-Type", "application/json")
        .json({ success: false, info: { message: "email already exists" } });
    }
  } else {
    console.log("error");
    res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .json({ success: false, info: { message: "you dont have a shop" } });
  }
};

exports.authenticate = (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err || !user) {
      console.log("err", err);
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, info });
    }
    req.login(user, { session: false }, (error) => {
      if (error) {
        console.log("error", error);
        return res
          .status(422)
          .setHeader("Content-Type", "application/json")
          .json(error.message);
      } else if (user && !error) {
        admin
          .auth()
          .createCustomToken(info._id.toString())
          .then((customToken) => {
            // Send token back to client
            const token = jwt.sign(info.email, process.env.secret_key);
            res.status(200).json({
              authtoken: customToken,
              success: true,
              data: info,
              accessToken: token,
            });
          })
          .catch((error) => {
            console.log("Error creating custom token:", error);
            res.status(400).json(null);
          });
      }
    });
  })(req, res, next);
};
