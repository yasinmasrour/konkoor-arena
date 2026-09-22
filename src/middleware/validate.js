const validate = (schema, target = "body") => {
  return (req, res, next) => {
    try {
      const data = req[target];
      const parsed = schema.parse(data);
      if (target === "body") {
        req.body = parsed;
      } else {
        Object.keys(req[target]).forEach((key) => {
          delete req[target][key];
        });
        Object.assign(req[target], parsed);
      }
      next();
    } catch (error) {
      if (!error.issues) {
        return next(error);
      }
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.join(".") || target,
          message: issue.message,
        })),
      });
    }
  };
};

module.exports = validate;
