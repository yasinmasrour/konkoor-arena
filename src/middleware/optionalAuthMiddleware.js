const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { jwtSecret } = require("../config/env");

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const [scheme, token] = authHeader.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== "bearer" || !token) return next();

    const decoded = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (user) {
      req.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        phoneVerifiedAt: user.phoneVerifiedAt,
        role: user.role?.name,
      };
    }
  } catch {
  }
  next();
};

module.exports = optionalAuth;
