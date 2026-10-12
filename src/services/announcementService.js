const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

// ==================== عمومی ====================

/**
 * اعلان‌های فعال (برای همه کاربران)
 * - بنر و کارت جدا برمی‌گردونه
 * - بر اساس priority مرتب میشه
 */
async function getActiveAnnouncements() {
  const now = new Date();

  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gte: now } }],
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      message: true,
      ctaText: true,
      ctaLink: true,
      variant: true,
      icon: true,
      displayType: true,
      dismissible: true,
      createdAt: true,
    },
  });

  // جدا کردن بنر و کارت
  const banner = announcements.find(
    (a) => a.displayType === "banner" || a.displayType === "both",
  );

  const card = announcements.find(
    (a) => a.displayType === "card" || a.displayType === "both",
  );

  return {
    banner: banner || null,
    card: card || null,
  };
}

/**
 * ثبت بازدید
 */
async function trackView(id) {
  return prisma.announcement.update({
    where: { id },
    data: { viewsCount: { increment: 1 } },
    select: { id: true },
  });
}

/**
 * ثبت کلیک
 */
async function trackClick(id) {
  return prisma.announcement.update({
    where: { id },
    data: { clicksCount: { increment: 1 } },
    select: { id: true },
  });
}

/**
 * ثبت بستن
 */
async function trackDismiss(id) {
  return prisma.announcement.update({
    where: { id },
    data: { dismissesCount: { increment: 1 } },
    select: { id: true },
  });
}

// ==================== ادمین ====================

async function adminList({ isActive, displayType, page = 1, limit = 20 }) {
  const where = {
    ...(isActive !== undefined && { isActive }),
    ...(displayType && { displayType }),
  };

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function adminGetById(id) {
  const item = await prisma.announcement.findUnique({ where: { id } });
  if (!item) throw new AppError("اعلان پیدا نشد", 404);
  return item;
}

async function adminCreate(data) {
  return prisma.announcement.create({ data });
}

async function adminUpdate(id, data) {
  await adminGetById(id);
  return prisma.announcement.update({ where: { id }, data });
}

async function adminDelete(id) {
  await adminGetById(id);
  await prisma.announcement.delete({ where: { id } });
  return { success: true };
}

async function adminToggleActive(id) {
  const item = await adminGetById(id);
  return prisma.announcement.update({
    where: { id },
    data: { isActive: !item.isActive },
  });
}

module.exports = {
  // عمومی
  getActiveAnnouncements,
  trackView,
  trackClick,
  trackDismiss,
  // ادمین
  adminList,
  adminGetById,
  adminCreate,
  adminUpdate,
  adminDelete,
  adminToggleActive,
};