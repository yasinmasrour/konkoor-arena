const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const profileSelect = {
  id: true,
  firstName: true,
  lastName: true,
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
  role: { select: { name: true } },
};

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: profileSelect });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

const updateUserProfile = async (userId, data) => {
  const clean = {
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
    major: data.major?.trim() || null,
    grade: data.grade?.trim() || null,
    email: data.email?.trim().toLowerCase() || null,
    nationalId: data.nationalId?.trim() || null,
    address: data.address?.trim() || null,
    city: data.city?.trim() || null,
    province: data.province?.trim() || null,
  };

  if (clean.birthDate && Number.isNaN(clean.birthDate.getTime())) {
    throw new AppError("Invalid birth date", 400);
  }

  if (clean.nationalId && !/^\d{10}$/.test(clean.nationalId)) {
    throw new AppError("National ID must contain 10 digits", 400);
  }

  if (!clean.major || !clean.grade || !clean.birthDate) {
    throw new AppError("Birth date, major and grade are required", 400);
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        clean.email ? { email: clean.email } : undefined,
        clean.nationalId ? { nationalId: clean.nationalId } : undefined,
      ].filter(Boolean),
      NOT: { id: userId },
    },
    select: { id: true, email: true, nationalId: true },
  });

  if (existing?.email && existing.email === clean.email) throw new AppError("Email already in use", 409);
  if (existing?.nationalId && existing.nationalId === clean.nationalId) throw new AppError("National ID already in use", 409);

  return prisma.user.update({ where: { id: userId }, data: clean, select: profileSelect });
};

module.exports = { getUserProfile, updateUserProfile };
