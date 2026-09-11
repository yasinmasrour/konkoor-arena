const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const prisma = require("../config/prisma");
const ROLES = require("../constants/roles");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { normalizePhoneNumber } = require("./smsService");
const { issueVerificationCode, verifyCode } = require("./verificationService");

const publicUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  phoneNumber: user.phoneNumber,
  email: user.email,
  role: user.role.name,
  phoneVerifiedAt: user.phoneVerifiedAt,
  birthDate: user.birthDate,
  major: user.major,
  grade: user.grade,
  nationalId: user.nationalId,
  address: user.address,
  city: user.city,
  province: user.province,
});

const issueToken = (user) =>
  jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });

const getUserWithRole = (id) =>
  prisma.user.findUnique({ where: { id }, include: { role: true } });

const registerUser = async ({
  firstName,
  lastName,
  username,
  phoneNumber,
  email,
  password,
}) => {
  const phone = normalizePhoneNumber(phoneNumber);
  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber: phone },
    include: { role: true },
  });

  if (existingUser?.phoneVerifiedAt) {
    throw new AppError("User already exists", 409);
  }

  const studentRole = await prisma.role.findUnique({
    where: { name: ROLES.STUDENT },
  });
  if (!studentRole) throw new AppError("Student role not found", 500);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName,
          lastName,
          username,
          email,
          password: hashedPassword,
          roleId: studentRole.id,
        },
        include: { role: true },
      })
    : await prisma.user.create({
        data: {
          firstName,
          lastName,
          username,
          email,
          phoneNumber: phone,
          password: hashedPassword,
          roleId: studentRole.id,
        },
        include: { role: true },
      });

  await issueVerificationCode({
    phoneNumber: phone,
    purpose: "PHONE_REGISTRATION",
  });
  return {
    user: publicUser(user),
    phoneNumber: phone,
    verificationRequired: true,
  };
};

const verifyRegistration = async (phoneNumber, code) => {
  const phone = normalizePhoneNumber(phoneNumber);
  await verifyCode({ phoneNumber: phone, code, purpose: "PHONE_REGISTRATION" });

  const user = await prisma.user.update({
    where: { phoneNumber: phone },
    data: { phoneVerifiedAt: new Date() },
    include: { role: true },
  });

  return { token: issueToken(user), user: publicUser(user) };
};

const loginUser = async (identifier, password) => {
  let normalizedIdentifier = identifier;

  if (/^09\d{9}$/.test(identifier)) {
    normalizedIdentifier = normalizePhoneNumber(identifier);
  }

  const user = await getUserWithRoleByIdentifier(normalizedIdentifier);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError("Invalid phone number or password", 401);

  await issueVerificationCode({
    phoneNumber: user.phoneNumber,
    purpose: "PHONE_LOGIN",
  });

  return {
    verificationRequired: true,
    phoneNumber: user.phoneNumber,
  };
};

const getUserWithRoleByIdentifier = async (identifier) => {
  return prisma.user.findFirst({
    where: {
      OR: [
        { phoneNumber: identifier },
        { email: identifier },
        { username: identifier },
      ],
    },
    include: {
      role: true,
    },
  });
};

const verifyLogin = async (phoneNumber, code) => {
  const phone = normalizePhoneNumber(phoneNumber);
  await verifyCode({ phoneNumber: phone, code, purpose: "PHONE_LOGIN" });

  const user = await getUserWithRoleByIdentifier(phone);
  if (!user || !user.phoneVerifiedAt)
    throw new AppError("Phone number is not verified", 403);

  return { token: issueToken(user), user: publicUser(user) };
};

module.exports = {
  registerUser,
  verifyRegistration,
  loginUser,
  verifyLogin,
  publicUser,
};
