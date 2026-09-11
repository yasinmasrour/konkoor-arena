const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { sendSmsVerificationCode } = require("./smsService");

const CODE_TTL_MS = 2 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const generateCode = () => String(crypto.randomInt(100000, 1000000));

const issueVerificationCode = async ({ phoneNumber, purpose = "PHONE_VERIFICATION" }) => {
  const recent = await prisma.verificationCode.findFirst({
    where: { phoneNumber, purpose, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new AppError("Please wait before requesting another verification code", 429);
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.verificationCode.updateMany({
    where: { phoneNumber, purpose, usedAt: null },
    data: { usedAt: new Date() },
  });

  const challenge = await prisma.verificationCode.create({
    data: {
      phoneNumber,
      purpose,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  try {
    await sendSmsVerificationCode({ phoneNumber, code });
  } catch (error) {
    await prisma.verificationCode.update({ where: { id: challenge.id }, data: { usedAt: new Date() } });
    throw error;
  }

  return { expiresAt: challenge.expiresAt };
};

const verifyCode = async ({ phoneNumber, code, purpose = "PHONE_VERIFICATION" }) => {
  const challenge = await prisma.verificationCode.findFirst({
    where: { phoneNumber, purpose, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.expiresAt < new Date()) {
    throw new AppError("Verification code expired or not found", 400);
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    throw new AppError("Too many verification attempts", 429);
  }

  const matches = await bcrypt.compare(String(code).trim(), challenge.codeHash);
  if (!matches) {
    await prisma.verificationCode.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AppError("Invalid verification code", 400);
  }

  await prisma.verificationCode.update({ where: { id: challenge.id }, data: { usedAt: new Date() } });
  return true;
};

module.exports = { issueVerificationCode, verifyCode };
