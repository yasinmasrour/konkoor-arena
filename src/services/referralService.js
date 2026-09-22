const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { generateUniqueReferralCode } = require("../utils/referralCode");
const {
  needsCycleReset,
  getCycleInfo,
  getCurrentCycleStart,
} = require("../utils/cycleHelper");
const {
  REFERRER_REWARD,
  REFEREE_DISCOUNT,
  MILESTONE_REWARD,
  MILESTONE_COUNT,
  STATUS,
  NOTIFICATIONS,
} = require("../constants/referral");
const walletService = require("./walletService");
const notificationService = require("./notificationService");

// ==================== 🔹 ریست دوره ====================
/**
 * چک میکنه آیا دوره کاربر تموم شده و اگه آره، ریستش کنه
 * - currentCycleReferrals = 0
 * - cycleStartDate = الان
 * - referralCode = کد جدید
 * @param {string} userId
 * @returns {Promise<{ reset: boolean, newCode?: string }>}
 */
async function checkAndResetCycle(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      cycleStartDate: true,
      currentCycleReferrals: true,
      referralCode: true,
    },
  });

  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  if (!needsCycleReset(user.cycleStartDate)) {
    return { reset: false };
  }

  // 🔹 کد جدید تولید کن
  const newCode = await generateUniqueReferralCode();

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentCycleReferrals: 0,
      cycleStartDate: getCurrentCycleStart(),
      referralCode: newCode,
    },
  });

  // 🔹 نوتیفیکیشن
await notificationService.createNotification({
  userId,
  type: "REFERRAL_CYCLE_RESET",
  title: NOTIFICATIONS.CYCLE_RESET.title,
  message: NOTIFICATIONS.CYCLE_RESET.message,
  link: "/referral",
});

  return { reset: true, newCode };
}

// ==================== 🔹 اطلاعات کاربر ====================
/**
 * اطلاعات کامل referral کاربر (کد، آمار، دوره، لیست دعوتها)
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getMyReferralInfo(userId) {
  // 🔹 اول چک کن دوره نیاز به ریست داره
  await checkAndResetCycle(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      referralCode: true,
      currentCycleReferrals: true,
      milestonesEarned: true,
      cycleStartDate: true,
    },
  });

  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  // 🔹 لیست دعوتهای موفق (completed)
  const referrals = await prisma.referral.findMany({
    where: {
      referrerId: userId,
      status: STATUS.COMPLETED,
    },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      status: true,
      referrerReward: true,
      milestoneIndex: true,
      completedAt: true,
      createdAt: true,
      referee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  // 🔹 آمار
  const totalRewards = referrals.reduce((sum, r) => sum + r.referrerReward, 0);
  const milestoneRewards =
    referrals.filter((r) => r.milestoneIndex !== null).length *
    MILESTONE_REWARD;

  const cycleInfo = getCycleInfo();

  // 🔹 چقدر تا جایزه بعدی مونده
  const remainingToNextMilestone =
    MILESTONE_COUNT - (user.currentCycleReferrals % MILESTONE_COUNT);

  return {
    referralCode: user.referralCode,
    cycle: {
      startDate: user.cycleStartDate,
      jalaliStart: cycleInfo.jalaliStart,
      jalaliEnd: cycleInfo.jalaliEnd,
      daysRemaining: cycleInfo.daysRemaining,
    },
    stats: {
      currentCycleReferrals: user.currentCycleReferrals,
      totalReferrals: referrals.length,
      milestonesEarned: user.milestonesEarned,
      totalRewards: totalRewards + milestoneRewards,
      remainingToNextMilestone,
    },
    referrals: referrals.map((r) => ({
      id: r.id,
      referee: {
        name: `${r.referee.firstName} ${r.referee.lastName}`,
        username: r.referee.username,
      },
      reward: r.referrerReward,
      isMilestone: r.milestoneIndex !== null,
      milestoneIndex: r.milestoneIndex,
      completedAt: r.completedAt,
    })),
  };
}

// ==================== 🔹 اعتبارسنجی کد ====================
/**
 * چک میکنه کد معتبره یا نه (برای frontend قبل از اعمال)
 * @param {string} userId - کاربری که میخواد کد رو استفاده کنه
 * @param {string} code
 * @returns {Promise<object>}
 */
async function validateCode(userId, code) {
  if (!code || typeof code !== "string") {
    throw new AppError("کد دعوت نامعتبر است", 400);
  }

  const normalizedCode = code.trim().toUpperCase();

  // 🔹 ۱) پیدا کردن صاحب کد
  const referrer = await prisma.user.findUnique({
    where: { referralCode: normalizedCode },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!referrer) {
    throw new AppError("کد دعوت پیدا نشد", 404);
  }

  // 🔹 ۲) جلوگیری از استفاده از کد خود
  if (referrer.id === userId) {
    throw new AppError("نمیتونید از کد خودتون استفاده کنید", 400);
  }

  // 🔹 ۳) چک کن کاربر توی این دوره از کد استفاده نکرده
  const cycleStart = getCurrentCycleStart();
  const existingReferral = await prisma.referral.findFirst({
    where: {
      refereeId: userId,
      status: STATUS.COMPLETED,
      createdAt: { gte: cycleStart },
    },
  });

  if (existingReferral) {
    throw new AppError(
      "شما توی این دوره قبلاً از یه کد دعوت استفاده کردهاید",
      400,
    );
  }

  return {
    valid: true,
    referrerName: `${referrer.firstName} ${referrer.lastName}`,
    discount: REFEREE_DISCOUNT,
  };
}

// ==================== 🔹 محاسبه تخفیف ====================
/**
 * محاسبه تخفیف برای یه پرداخت (بدون ذخیره)
 * @param {string} userId
 * @param {string} code
 * @param {number} amount - مبلغ اصلی
 * @returns {Promise<{ discount: number, finalAmount: number, referrerId: string, code: string }>}
 */
async function calculateDiscount(userId, code, amount) {
  const validation = await validateCode(userId, code);

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code.trim().toUpperCase() },
    select: { id: true },
  });

  const discount = Math.min(REFEREE_DISCOUNT, amount);

  return {
    discount,
    finalAmount: Math.max(0, amount - discount),
    referrerId: referrer.id,
    code: code.trim().toUpperCase(),
    referrerName: validation.referrerName,
  };
}

// ==================== 🔹 ساخت Referral Pending ====================
/**
 * قبل از پرداخت، یه Referral با وضعیت pending میسازه
 * (بعد از پرداخت، completeReferral صدا زده میشه)
 * @param {object} params
 * @param {string} params.refereeId
 * @param {string} params.code
 * @param {number} params.discount
 * @returns {Promise<object>}
 */
async function createPendingReferral({ refereeId, code, discount }) {
  const normalizedCode = code.trim().toUpperCase();

  const referrer = await prisma.user.findUnique({
    where: { referralCode: normalizedCode },
    select: { id: true },
  });

  if (!referrer) throw new AppError("کد دعوت پیدا نشد", 404);

  return prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeId,
      code: normalizedCode,
      status: STATUS.PENDING,
      referrerReward: REFERRER_REWARD,
      refereeDiscount: discount,
    },
  });
}

// ==================== 🔹 تکمیل Referral (بعد از پرداخت) ====================
/**
 * بعد از پرداخت موفق:
 * 1. Referral → completed
 * 2. پرداخت جایزه ۳۰۰K به کیف پول دعوتکننده
 * 3. چک milestone (هر ۱۰ دعوت)
 * 4. نوتیفیکیشن
 * @param {string} referralId
 * @param {string} paymentId
 * @returns {Promise<object>}
 */
async function completeReferral(referralId, paymentId) {
  // 🔹 ۱) پیدا کردن Referral
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      referrer: {
        select: {
          id: true,
          firstName: true,
          currentCycleReferrals: true,
          milestonesEarned: true,
          cycleStartDate: true,
        },
      },
      referee: { select: { firstName: true, lastName: true } },
    },
  });

  if (!referral) throw new AppError("Referral پیدا نشد", 404);
  if (referral.status !== STATUS.PENDING) {
    throw new AppError("این Referral قبلاً پردازش شده", 400);
  }

  // 🔹 ۲) آپدیت Referral
  const updatedReferral = await prisma.referral.update({
    where: { id: referralId },
    data: {
      status: STATUS.COMPLETED,
      completedAt: new Date(),
      rewardPaidAt: new Date(),
    },
  });

  // 🔹 ۳) چک ریست دوره برای دعوتکننده
  await checkAndResetCycle(referral.referrer.id);

  // 🔹 ۴) آپدیت شمارنده دعوتکننده
  const referrer = await prisma.user.findUnique({
    where: { id: referral.referrer.id },
    select: { currentCycleReferrals: true, milestonesEarned: true },
  });

  const newCycleCount = referrer.currentCycleReferrals + 1;
  const isMilestone = newCycleCount % MILESTONE_COUNT === 0;

  await prisma.user.update({
    where: { id: referral.referrer.id },
    data: {
      currentCycleReferrals: newCycleCount,
      ...(isMilestone && { milestonesEarned: referrer.milestonesEarned + 1 }),
    },
  });

  // 🔹 ۵) پرداخت جایزه ۳۰۰K به کیف پول دعوتکننده
  await walletService.rewardWallet({
    userId: referral.referrer.id,
    amount: REFERRER_REWARD,
    description: `جایزه دعوت ${referral.referee.firstName} ${referral.referee.lastName}`,
    referenceId: referral.id,
    referenceType: "REFERRAL",
  });

  // 🔹 ۶) نوتیف به دعوتکننده
  await notificationService.createNotification({
    userId: referral.referrer.id,
    type: "REFERRAL_REWARD",
    title: NOTIFICATIONS.REFEREE_USED.title,
    message: `${referral.referee.firstName} ${referral.referee.lastName} با کد شما ثبتنام کرد. ${REFERRER_REWARD.toLocaleString()} تومان به کیف پولتون اضافه شد.`,
    link: "/referral",
  });

  // 🔹 ۷) اگه milestone بود، جایزه ۳M + نوتیف
  if (isMilestone) {
    const milestoneIndex = newCycleCount;
    await prisma.referral.update({
      where: { id: referralId },
      data: { milestoneIndex },
    });

    await walletService.rewardWallet({
      userId: referral.referrer.id,
      amount: MILESTONE_REWARD,
      description: `جایزه ویژه ${MILESTONE_COUNT} دعوت موفق`,
      referenceId: referral.id,
      referenceType: "REFERRAL_MILESTONE",
    });

    await notificationService.createNotification({
      userId: referral.referrer.id,
      type: "REFERRAL_MILESTONE",
      title: NOTIFICATIONS.MILESTONE_REACHED.title,
      message: NOTIFICATIONS.MILESTONE_REACHED.message,
      link: "/referral",
    });
  }

  return {
    referral: updatedReferral,
    isMilestone,
    milestoneIndex: isMilestone ? newCycleCount : null,
  };
}

// ==================== 🔹 تاریخچه ====================
/**
 * لیست دعوتهای کاربر با pagination
 * @param {string} userId
 * @param {object} options
 * @returns {Promise<object>}
 */
async function getReferralHistory(userId, { page = 1, limit = 20 } = {}) {
  const where = {
    referrerId: userId,
    status: STATUS.COMPLETED,
  };

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      orderBy: { completedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        status: true,
        referrerReward: true,
        milestoneIndex: true,
        completedAt: true,
        referee: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    }),
    prisma.referral.count({ where }),
  ]);

  return {
    referrals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  getMyReferralInfo,
  validateCode,
  calculateDiscount,
  createPendingReferral,
  completeReferral,
  checkAndResetCycle,
  getReferralHistory,
};
