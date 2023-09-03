const express = require("express");
const roomController = require("../controllers/rooms");
const roomRouter = express.Router();
const roomsModel = require("../models/roomSchema");

const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

let upload = multer({ storage, fileFilter });

roomRouter
  .route("/rooms/roomnotifications")
  .post(roomController.sendRoomNotifications);
roomRouter
  .route("/removecurrentroom/:userId")
  .put(roomController.removeFromCurrentRoom);

roomRouter
  .route("/:userId")
  .post(upload.any("productImages"), roomController.createRoom);

roomRouter
  .route("/newevent/:userId")
  .post(upload.any("productImages"), roomController.createEvent);

roomRouter
  .route("/rooms/:roomId")
  .get(roomController.getRoomById)
  .put(upload.any("productImages"), roomController.updateRoomById)
  .delete(roomController.deleteRoomById);

roomRouter.route("/ended/:roomId").get(roomController.getDeletedRoomById);

roomRouter.route("/stoprecording/:sid").post(roomController.stopRecording);

roomRouter.route("/record/:channelname").post(roomController.recordRoom);

roomRouter.route("/get/all/:userId").get(roomController.getRoomsByUserId);



roomRouter.route("/user/add/:roomId").put(roomController.addUserToRoom);

roomRouter.route("/user/remove/:roomId").put(roomController.removeUserFromRoom);

roomRouter
  .route("/speaker/remove/:roomId")
  .put(roomController.removeSpeakerRoom);

roomRouter
  .route("/invitedSpeaker/remove/:roomId")
  .put(roomController.removeInvitedSpeakerRoom);

roomRouter.route("/host/remove/:roomId").put(roomController.removeHostRoom);

roomRouter
  .route("/audience/remove/:roomId")
  .put(roomController.removeUserFromAudienceRoom);

roomRouter
  .route("/raisedhans/remove/:roomId")
  .put(roomController.removeRaisedHandRoom);

roomRouter
  .route("/agora/rooom/generatetoken")
  .post(roomController.generateagoratoken);
roomRouter
  .route("/agora/rooom/rtmtoken/:id")
  .get(roomController.generateRtmToken);

roomRouter.route("/test/:roomId").post(async (req, res) => {
  try {
    let updatedRoom = await roomsModel.findByIdAndUpdate(
      req.params.roomId,
      {
        $addToSet: { userIds: req.body.users },
      },
      { runValidators: true, new: true, upsert: false }
    );
    res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .json(updatedRoom);
  } catch (error) {
    res
      .status(422)
      .setHeader("Content-Type", "application/json")
      .json(error.message);
  }
});

roomRouter.route("/allrooms/paginated").get(roomController.getAllTokshows);
roomRouter.route("/activetokshows").get(roomController.getActiveTokshows);

roomRouter.route("/add/featured/:roomid").put(roomController.addProducttoRoom);
roomRouter.route("/remove/featured").put(roomController.removeFeaturedProduct);
roomRouter
  .route("/rooms/product/:roomid")
  .put(roomController.removeProductFromroom);
  
//events
  
roomRouter.route("/event/:roomId").get(roomController.getEventById);
roomRouter.route("/myevents/:userId").get(roomController.getMyEvents);
roomRouter.route("/events/:id").get(roomController.getAllEvents); //to be removed
roomRouter.route("/allevents").get(roomController.getAllEvents); 

module.exports = roomRouter;
