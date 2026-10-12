const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

/**
 * ساخت پیام تماس جدید
 */
const createContactMessage = async ({
  name,
  email,
  phone,
  subject,
  message,
  userId,
  ip,
  userAgent,
}) => {
  return prisma.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      userId: userId || null,
      ip: ip || null,
      userAgent: userAgent || null,
      status: "NEW",
    },
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      status: true,
      createdAt: true,
    },
  });
};

/**
 * لیست پیام‌ها (ادمین)
 */
const listContactMessages = async ({
  page = 1,
  limit = 20,
  status,
  search,
  sort = "createdAt",
  order = "desc",
}) => {
  const where = {};

  if (status) where.status = status;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * آمار پیام‌ها (ادمین) — برای badge
 */
const getContactStats = async () => {
  const [newCount, totalCount] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.contactMessage.count(),
  ]);

  return { newCount, totalCount };
};

/**
 * دریافت یک پیام (ادمین)
 */
const getContactMessageById = async (id) => {
  const msg = await prisma.contactMessage.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!msg) throw new AppError("پیام پیدا نشد", 404);
  return msg;
};

/**
 * آپدیت وضعیت پیام (ادمین)
 */
const updateContactMessage = async (id, { status, adminNote }) => {
  await getContactMessageById(id); // چک وجود

  const data = {};
  if (status !== undefined) data.status = status;
  if (adminNote !== undefined) data.adminNote = adminNote || null;

  if (status === "REPLIED" && !data.repliedAt) {
    data.repliedAt = new Date();
  }

  return prisma.contactMessage.update({
    where: { id },
    data,
  });
};

/**
 * حذف پیام (ادمین)
 */
const deleteContactMessage = async (id) => {
  await getContactMessageById(id);
  await prisma.contactMessage.delete({ where: { id } });
  return { success: true };
};

module.exports = {
  createContactMessage,
  listContactMessages,
  getContactStats,
  getContactMessageById,
  updateContactMessage,
  deleteContactMessage,
};
