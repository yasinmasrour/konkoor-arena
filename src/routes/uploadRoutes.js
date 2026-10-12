const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

// همه‌ی routeها نیاز به لاگین دارن
router.use(protect);

// فقط نویسنده‌ها (ADMIN/COUNSELOR) می‌تونن آپلود کنن
router.use(allowRoles("ADMIN", "COUNSELOR"));

router.post("/image", upload.single("file"), uploadController.uploadImage);

router.post(
  "/blog-cover",
  upload.single("file"),
  uploadController.uploadBlogCover,
);

router.post(
  "/blog-content",
  upload.single("file"),
  uploadController.uploadBlogContent,
);

module.exports = router;
