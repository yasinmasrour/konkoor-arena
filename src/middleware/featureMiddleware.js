const AppError = require("../utils/appError");
const { hasFeatureAccess } = require("../utils/accessHelper");
const { FEATURE_LABELS } = require("../constants/features");

/**
 * Middleware برای چک دسترسی به یه feature
 * @param {string} featureName
 * @returns {Function}
 */
const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("احراز هویت الزامی است", 401);
      }

      const hasAccess = await hasFeatureAccess(
        req.user.id,
        featureName,
        req.user.role,
      );

      if (!hasAccess) {
        const label = FEATURE_LABELS[featureName] || featureName;
        throw new AppError(
          `برای دسترسی به «${label}» باید اشتراک مناسب تهیه کنید`,
          403,
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { requireFeature };
