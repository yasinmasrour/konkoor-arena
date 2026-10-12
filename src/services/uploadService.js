const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const s3 = require("../config/s3");
const env = require("../config/env");
const AppError = require("../utils/appError");

// پسوندهای مجاز
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// 🆕 نقشه‌ی MIME → extension (بجای گرفتن از نام فایل کاربر)
const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // ۵ مگابایت

/**
 * 🆕 sanitize کردن folder — فقط حروف کوچک انگلیسی، اعداد، dash و slash
 */
function sanitizeFolder(folder) {
  if (!folder || typeof folder !== "string") return "uploads";

  return (
    folder
      .split("/")
      .map((part) =>
        part
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")
          .trim(),
      )
      .filter(Boolean)
      .join("/") || "uploads"
  );
}

/**
 * آپلود فایل به S3
 * @param {Object} file - multer file object
 * @param {string} folder - مسیر پوشه (مثلاً "blog/covers")
 */
async function uploadFile(file, folder = "uploads") {
  if (!file) throw new AppError("فایلی ارسال نشده", 400);

  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    throw new AppError("فرمت فایل مجاز نیست. فقط jpg, png, webp, gif", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError("حجم فایل بیشتر از ۵ مگابایت است", 400);
  }

  // 🆕 پسوند رو از MIME بگیر (نه از نام فایل کاربر)
  const ext = MIME_TO_EXT[file.mimetype] || ".jpg";

  // 🆕 نام یکتا — فقط hex و timestamp
  const hash = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const fileName = `${timestamp}-${hash}${ext}`;

  // 🆕 folder تمیز
  const safeFolder = sanitizeFolder(folder);
  const key = `${safeFolder}/${fileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000, immutable",
    });

    await s3.send(command);

    // 🆕 URL تمیز — key خودش شامل / هست، پس URL معتبر می‌سازیم
    const url = `${env.s3PublicUrl}/${key}`.split("?")[0];

    return {
      url,
      key,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (err) {
    console.error("S3 upload error:", err);
    throw new AppError("آپلود فایل انجام نشد", 500);
  }
}

/**
 * حذف فایل از S3
 */
async function deleteFile(key) {
  if (!key) return { success: true };

  try {
    const command = new DeleteObjectCommand({
      Bucket: env.s3Bucket,
      Key: key,
    });
    await s3.send(command);
    return { success: true };
  } catch (err) {
    console.error("S3 delete error:", err);
    throw new AppError("حذف فایل انجام نشد", 500);
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  ALLOWED_MIMES,
  MAX_FILE_SIZE,
};
