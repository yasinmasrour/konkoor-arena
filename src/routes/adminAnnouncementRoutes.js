const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const adminAnnouncementController = require("../controllers/adminAnnouncementController");
const {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  adminListAnnouncementsSchema,
} = require("../validations/announcementValidation");

const router = express.Router();

router.use(protect);
router.use(allowRoles("ADMIN"));

router.get(
  "/",
  validate(adminListAnnouncementsSchema, "query"),
  adminAnnouncementController.adminList,
);

router.get("/:id", adminAnnouncementController.adminGetById);

router.post(
  "/",
  validate(createAnnouncementSchema),
  adminAnnouncementController.adminCreate,
);

router.patch(
  "/:id",
  validate(updateAnnouncementSchema),
  adminAnnouncementController.adminUpdate,
);

router.patch("/:id/toggle", adminAnnouncementController.adminToggleActive);

router.delete("/:id", adminAnnouncementController.adminDelete);

module.exports = router;
