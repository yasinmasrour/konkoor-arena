const multer = require("multer");
const { ALLOWED_MIMES, MAX_FILE_SIZE } = require("../services/uploadService");

// حافظه موقت (buffer) — به S3 می‌فرستیم
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("فرمت فایل مجاز نیست"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = upload;