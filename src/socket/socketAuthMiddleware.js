const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },

      include: {
        role: true,
      },
    });

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name,
    };

    next();
  } catch (error) {
    return next(new Error("Unauthorized"));
  }
};

module.exports = socketAuthMiddleware;
