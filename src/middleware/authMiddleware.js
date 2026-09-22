const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { jwtSecret } = require("../config/env");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Unauthorized", 401);
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new AppError("Invalid authorization header", 401);
  }

  const decoded = jwt.verify(token, jwtSecret);

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },

    include: {
      role: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = {
    id: user.id,

    firstName: user.firstName,

    lastName: user.lastName,

    phoneNumber: user.phoneNumber,

    email: user.email,

    phoneVerifiedAt: user.phoneVerifiedAt,

    birthDate: user.birthDate,

    major: user.major,

    grade: user.grade,

    nationalId: user.nationalId,

    address: user.address,

    city: user.city,

    province: user.province,

    role: user.role?.name,
  };

  next();
});

module.exports = protect;
