const AppError = require("./appError");

const prismaErrorHandler = (error) => {
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "Field";

    return new AppError(`${field} already exists`, 409);
  }

  if (error.code === "P2025") {
    return new AppError("Record not found", 404);
  }

  return error;
};

module.exports = prismaErrorHandler;
