const AppError = require("../utils/appError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    error = new AppError(error.message || "Something went wrong", 500);
  }

  res.status(error.statusCode || 500).json({
    status: error.status || "error",

    message: error.message,

    ...(error.errors && {
      errors: error.errors,
    }),
  });
};

module.exports = errorHandler;
