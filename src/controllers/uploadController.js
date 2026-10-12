const asyncHandler = require("../utils/asyncHandler");
const uploadService = require("../services/uploadService");
const AppError = require("../utils/appError");

/**
 * POST /upload/image
 * آپلود تصویر عمومی (مقاله، کاور، آواتار)
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("فایلی ارسال نشده", 400);

  // پوشه بر اساس نوع (اختیاری)
  const folder = req.body.folder || "uploads";

  const result = await uploadService.uploadFile(req.file, folder);

  res.status(201).json({
    message: "تصویر با موفقیت آپلود شد",
    ...result,
  });
});

/**
 * POST /upload/blog-cover
 * آپلود کاور مقاله
 */
const uploadBlogCover = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("فایلی ارسال نشده", 400);

  const result = await uploadService.uploadFile(req.file, "blog/covers");

  res.status(201).json({
    message: "کاور با موفقیت آپلود شد",
    ...result,
  });
});

/**
 * POST /upload/blog-content
 * آپلود تصویر داخل متن مقاله
 */
const uploadBlogContent = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("فایلی ارسال نشده", 400);

  const result = await uploadService.uploadFile(req.file, "blog/content");

  res.status(201).json({
    message: "تصویر با موفقیت آپلود شد",
    ...result,
  });
});

module.exports = {
  uploadImage,
  uploadBlogCover,
  uploadBlogContent,
};