const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const prisma = require("../config/prisma");
const ROLES = require("../constants/roles");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { normalizePhoneNumber } = require("./smsService");

// ============================================================
// SMS / OTP AUTH — TEMPORARILY DISABLED
// ============================================================
// SMS/OTP services are intentionally not used by the active
// authentication flow.
//
// They remain in the project so that SMS authentication can
// be re-enabled later.
//
// const {
//   issueVerificationCode,
//   verifyCode,
// } = require("./verificationService");
// ============================================================

const { generateUniqueReferralCode } = require("../utils/referralCode");

const {
  getUserFeatures,
  getUserExamPurchases,
} = require("../utils/accessHelper");

// ============================================================
// PUBLIC USER
// ============================================================

const publicUser = async (user) => {
  const roleName = user.role?.name;

  const [features, examPurchases] = await Promise.all([
    getUserFeatures(user.id, roleName),
    getUserExamPurchases(user.id),
  ]);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.role,
    phoneVerifiedAt: user.phoneVerifiedAt,
    birthDate: user.birthDate,
    major: user.major,
    grade: user.grade,
    nationalId: user.nationalId,
    address: user.address,
    city: user.city,
    province: user.province,
    features,
    examPurchases,
  };
};

// ============================================================
// JWT
// ============================================================

const issueToken = (user) =>
  jwt.sign(
    {
      id: user.id,
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
    },
  );

// ============================================================
// USER HELPERS
// ============================================================

const getUserWithRole = (id) =>
  prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      role: true,
    },
  });

const getUserWithRoleByIdentifier = async (identifier) => {
  return prisma.user.findFirst({
    where: {
      OR: [
        {
          phoneNumber: identifier,
        },
        {
          email: identifier,
        },
        {
          username: identifier,
        },
      ],
    },
    include: {
      role: true,
    },
  });
};

// ============================================================
// REGISTER
// ============================================================

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
    where: {
      phoneNumber: phone,
    },
    include: {
      role: true,
    },
  });

  /*
   * ----------------------------------------------------------
   * Existing verified user
   * ----------------------------------------------------------
   *
   * SMS verification is disabled, but we keep the old
   * phoneVerifiedAt field for compatibility with the rest
   * of the application.
   */
  if (existingUser?.phoneVerifiedAt) {
    throw new AppError("User already exists", 409);
  }

  const studentRole = await prisma.role.findUnique({
    where: {
      name: ROLES.STUDENT,
    },
  });

  if (!studentRole) {
    throw new AppError("Student role not found", 500);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const referralCode = await generateUniqueReferralCode();

  let user;

  if (existingUser) {
    /*
     * --------------------------------------------------------
     * Existing incomplete user
     * --------------------------------------------------------
     *
     * This branch is kept for compatibility with accounts
     * that may have been created before SMS verification
     * was disabled.
     */
    user = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        roleId: studentRole.id,

        // SMS verification is disabled.
        // We mark the account as verified so old checks
        // elsewhere in the application do not block the user.
        phoneVerifiedAt: new Date(),

        ...(existingUser.referralCode
          ? {}
          : {
              referralCode,
            }),
      },
      include: {
        role: true,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        phoneNumber: phone,
        password: hashedPassword,
        roleId: studentRole.id,

        // SMS verification is currently disabled.
        // Keep the field populated for backward compatibility.
        phoneVerifiedAt: new Date(),

        referralCode,
      },
      include: {
        role: true,
      },
    });
  }

  /*
   * ==========================================================
   * SMS / OTP REGISTRATION — DISABLED
   * ==========================================================
   *
   * The old registration flow was:
   *
   * await issueVerificationCode({
   *   phoneNumber: phone,
   *   purpose: "PHONE_REGISTRATION",
   * });
   *
   * It is intentionally disabled for now.
   * ==========================================================
   */

  return {
    token: issueToken(user),
    user: await publicUser(user),
  };
};

// ============================================================
// SMS / OTP REGISTRATION VERIFICATION — DISABLED
// ============================================================

/*
const verifyRegistration = async (phoneNumber, code) => {
  const phone = normalizePhoneNumber(phoneNumber);

  await verifyCode({
    phoneNumber: phone,
    code,
    purpose: "PHONE_REGISTRATION",
  });

  const user = await prisma.user.update({
    where: {
      phoneNumber: phone,
    },
    data: {
      phoneVerifiedAt: new Date(),
    },
    include: {
      role: true,
    },
  });

  return {
    token: issueToken(user),
    user: await publicUser(user),
  };
};
*/

// ============================================================
// LOGIN
// ============================================================

const loginUser = async (identifier, password) => {
  let normalizedIdentifier = String(identifier || "").trim();

  /*
   * If the identifier looks like an Iranian mobile number,
   * normalize it before querying the database.
   */
  if (/^09\d{9}$/.test(normalizedIdentifier)) {
    normalizedIdentifier = normalizePhoneNumber(normalizedIdentifier);
  }

  const user = await getUserWithRoleByIdentifier(normalizedIdentifier);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  /*
   * ==========================================================
   * SMS / OTP LOGIN — DISABLED
   * ==========================================================
   *
   * The old login flow sent an SMS verification code here:
   *
   * await issueVerificationCode({
   *   phoneNumber: user.phoneNumber,
   *   purpose: "PHONE_LOGIN",
   * });
   *
   * This is intentionally disabled.
   * ==========================================================
   */

  return {
    token: issueToken(user),
    user: await publicUser(user),
  };
};

// ============================================================
// SMS / OTP LOGIN VERIFICATION — DISABLED
// ============================================================

/*
const verifyLogin = async (phoneNumber, code) => {
  const phone = normalizePhoneNumber(phoneNumber);

  await verifyCode({
    phoneNumber: phone,
    code,
    purpose: "PHONE_LOGIN",
  });

  const user = await getUserWithRoleByIdentifier(phone);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    token: issueToken(user),
    user: await publicUser(user),
  };
};
*/

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  registerUser,
  loginUser,
  publicUser,

  // SMS/OTP authentication is temporarily disabled.
  // These functions are intentionally kept commented out
  // so they can be restored later.
  //
  // verifyRegistration,
  // verifyLogin,
};
