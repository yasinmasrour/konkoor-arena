const AppError = require("../utils/appError");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));
      throw new AppError("Validation failed", 400, errors);
    }
    req.body = result.data;
    next();
  };
};

module.exports = validate;
