const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const profileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  phoneNumber: true,
  phoneVerifiedAt: true,
  email: true,
  birthDate: true,
  major: true,
  grade: true,
  nationalId: true,
  address: true,
  city: true,
  province: true,
  role: { select: { id: true, name: true } },
};

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

const updateUserProfile = async (userId, data) => {
  // 🆕 فقط فیلدهایی که توی req.body هستن رو آپدیت کن
  const clean = {};

  // ✅ firstName
  if (data.firstName !== undefined) {
    const firstName = data.firstName?.trim();
    if (!firstName || firstName.length < 2) {
      throw new AppError("نام باید حداقل ۲ کاراکتر باشد", 400);
    }
    clean.firstName = firstName;
  }

  // ✅ lastName
  if (data.lastName !== undefined) {
    const lastName = data.lastName?.trim();
    if (!lastName || lastName.length < 2) {
      throw new AppError("نام خانوادگی باید حداقل ۲ کاراکتر باشد", 400);
    }
    clean.lastName = lastName;
  }

  // ✅ بقیه فیلدها (با `!== undefined` چک کن)
  if (data.birthDate !== undefined) {
    clean.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (clean.birthDate && Number.isNaN(clean.birthDate.getTime())) {
      throw new AppError("تاریخ تولد معتبر نیست", 400);
    }
  }

  if (data.major !== undefined) {
    clean.major = data.major?.trim() || null;
  }

  if (data.grade !== undefined) {
    clean.grade = data.grade?.trim() || null;
  }

  if (data.email !== undefined) {
    clean.email = data.email?.trim().toLowerCase() || null;
  }

  if (data.nationalId !== undefined) {
    clean.nationalId = data.nationalId?.trim() || null;
    if (clean.nationalId && !/^\d{10}$/.test(clean.nationalId)) {
      throw new AppError("کد ملی باید ۱۰ رقم باشد", 400);
    }
  }

  if (data.address !== undefined) {
    clean.address = data.address?.trim() || null;
  }

  if (data.city !== undefined) {
    clean.city = data.city?.trim() || null;
  }

  if (data.province !== undefined) {
    clean.province = data.province?.trim() || null;
  }

  // اگه هیچ فیلدی برای آپدیت نبود
  if (Object.keys(clean).length === 0) {
    throw new AppError("هیچ فیلدی برای به‌روزرسانی ارسال نشده است", 400);
  }

  // بررسی تکراری نبودن ایمیل/کد ملی
  if (clean.email || clean.nationalId) {
    const orConditions = [];
    if (clean.email) orConditions.push({ email: clean.email });
    if (clean.nationalId) orConditions.push({ nationalId: clean.nationalId });

    const existing = await prisma.user.findFirst({
      where: {
        OR: orConditions,
        NOT: { id: userId },
      },
      select: { id: true, email: true, nationalId: true },
    });

    if (existing?.email === clean.email) {
      throw new AppError("این ایمیل قبلاً استفاده شده است", 409);
    }
    if (existing?.nationalId === clean.nationalId) {
      throw new AppError("این کد ملی قبلاً استفاده شده است", 409);
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: clean,
    select: profileSelect,
  });
};

// 🔹 تغییر رمز عبور
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) throw new AppError("User not found", 404);

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new AppError("رمز عبور فعلی اشتباه است", 401);
  }

  const samePassword = await bcrypt.compare(newPassword, user.password);
  if (samePassword) {
    throw new AppError("رمز جدید نباید با رمز فعلی یکسان باشد", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  profileSelect,
};
