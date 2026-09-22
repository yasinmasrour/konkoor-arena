const AppError = require("../utils/appError");

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    const userRoleName =
      typeof req.user.role === "object" && req.user.role !== null
        ? req.user.role.name
        : req.user.role;

    console.log("User role:", userRoleName);
    console.log("Allowed roles:", roles);

    if (!roles.includes(userRoleName)) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
};

module.exports = allowRoles;
