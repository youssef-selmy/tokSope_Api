const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channels");

router.get("/count/", channelController.getChannelCount);
router.get("/", channelController.getAllChannels);
router.get("/:id", channelController.getChannelById);
router.post("/", channelController.saveChannel);
router.put("/:id", channelController.updateChannel);
router.put("/subscribe/:channelId", channelController.subscribeToChannel);
router.put("/unsubscribe/:channelId", channelController.unSubscribeFromChannel);
router.put("/rooms/add/:channelId", channelController.addRoom);
router.put("/rooms/remove/:channelId", channelController.removeRoom);
router.delete("/:id", channelController.deleteChannel);

module.exports = router;
