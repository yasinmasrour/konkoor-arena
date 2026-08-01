const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const ROLES = require("../constants/roles");

const controller = require("../controllers/examController");


router.post(
    "/",
    authMiddleware,
    roleMiddleware(
        ROLES.ADMIN,
        ROLES.COUNSELOR
    ),
    controller.createExam
);


router.get(
    "/",
    authMiddleware,
    controller.getExams
);


router.get(
    "/:id",
    authMiddleware,
    controller.getExamById
);


router.patch(
    "/:id",
    authMiddleware,
    roleMiddleware(
        ROLES.ADMIN,
        ROLES.COUNSELOR
    ),
    controller.updateExam
);


router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(
        ROLES.ADMIN
    ),
    controller.deleteExam
);



module.exports = router;