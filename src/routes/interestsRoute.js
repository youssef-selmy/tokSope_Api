const express = require("express");
const router = express.Router();
const interestsController = require("../controllers/interests");

router.get("/all/:id", interestsController.getInterests);
router.get("/:id", interestsController.getInterestsById);
router.post("/", interestsController.saveInterest);
router.delete("/:id", interestsController.deleteInterest);
router.put("/:id", interestsController.updateInterest);

module.exports = router;
 