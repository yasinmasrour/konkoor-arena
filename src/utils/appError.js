class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);

    this.statusCode = statusCode;

    this.errors = errors;

    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
