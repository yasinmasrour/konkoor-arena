const express = require("express");

const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const ROLES = require("../constants/roles");
const {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
} = require("../validations/subscriptionValidation");

const router = express.Router();

router.get("/", subscriptionController.getPlans);

router.get("/:id", subscriptionController.getPlanById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createSubscriptionPlanSchema),
  subscriptionController.createPlan,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateSubscriptionPlanSchema),
  subscriptionController.updatePlan,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  subscriptionController.deletePlan,
);

module.exports = router;
