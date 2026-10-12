const asyncHandler = require("../utils/asyncHandler");
const contactService = require("../services/contactService");

/**
 * POST /contact
 * عمومی (مهمان یا لاگین‌شده)
 */
const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const contactMessage = await contactService.createContactMessage({
    name,
    email,
    phone,
    subject,
    message,
    userId: req.user?.id || null,
    ip: req.ip || req.headers["x-forwarded-for"] || null,
    userAgent: req.headers["user-agent"] || null,
  });

  res.status(201).json({
    message: "پیام شما با موفقیت ارسال شد. به‌زودی با شما تماس می‌گیریم.",
    contactMessage,
  });
});

/**
 * GET /admin/contact-messages
 * فقط ادمین
 */
const listContactMessages = asyncHandler(async (req, res) => {
  const result = await contactService.listContactMessages({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    status: req.query.status,
    search: req.query.search,
    sort: req.query.sort || "createdAt",
    order: req.query.order || "desc",
  });

  res.status(200).json(result);
});

/**
 * GET /admin/contact-messages/stats
 */
const getContactStats = asyncHandler(async (req, res) => {
  const stats = await contactService.getContactStats();
  res.status(200).json(stats);
});

/**
 * GET /admin/contact-messages/:id
 */
const getContactMessageById = asyncHandler(async (req, res) => {
  const msg = await contactService.getContactMessageById(req.params.id);
  res.status(200).json({ contactMessage: msg });
});

/**
 * PATCH /admin/contact-messages/:id
 */
const updateContactMessage = asyncHandler(async (req, res) => {
  const msg = await contactService.updateContactMessage(
    req.params.id,
    req.body,
  );
  res.status(200).json({
    message: "پیام با موفقیت آپدیت شد",
    contactMessage: msg,
  });
});

/**
 * DELETE /admin/contact-messages/:id
 */
const deleteContactMessage = asyncHandler(async (req, res) => {
  await contactService.deleteContactMessage(req.params.id);
  res.status(200).json({ message: "پیام با موفقیت حذف شد" });
});

module.exports = {
  createContactMessage,
  listContactMessages,
  getContactStats,
  getContactMessageById,
  updateContactMessage,
  deleteContactMessage,
};
