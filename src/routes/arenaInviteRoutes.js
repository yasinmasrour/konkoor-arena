const express = require("express");
const arenaInviteController = require("../controllers/arenaInviteController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createInviteSchema } = require("../validations/arenaInviteValidation");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createInviteSchema),
  arenaInviteController.createInvite,
);

router.get("/my", arenaInviteController.getMyInvite);

router.get("/:code", arenaInviteController.getInvite);

router.post("/:code/accept", arenaInviteController.acceptInvite);

router.delete("/:code", arenaInviteController.cancelInvite);

module.exports = router;
