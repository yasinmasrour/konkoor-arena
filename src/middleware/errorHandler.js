const AppError = require("../utils/appError");
const prismaErrorHandler = require("../utils/prismaErrorHandler");
const jwt = require("jsonwebtoken");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error instanceof jwt.TokenExpiredError) {
    error = new AppError("Token expired", 401);
  } else if (error instanceof jwt.JsonWebTokenError) {
    error = new AppError("Invalid token", 401);
  } else {
    error = prismaErrorHandler(error);
  }

  // if (!(error instanceof AppError)) {
  //   error = new AppError("Internal server error", 500);
  // }

  res.status(error.statusCode || 500).json({
    status: error.status || "error",

    message: error.message,

    ...(error.errors && {
      errors: error.errors,
    }),
  });
};

module.exports = errorHandler;
