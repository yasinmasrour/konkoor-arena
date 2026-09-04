require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const jwtSecret = process.env.JWT_SECRET;

if (isProduction && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error(
    "JWT_SECRET must be set and at least 32 characters in production",
  );
}

if (!jwtSecret) {
  console.warn(
    "WARNING: JWT_SECRET is not set. Authentication will not work correctly.",
  );
}

const parseCorsOrigins = (value) => {
  if (!value || value.trim() === "*") {
    return "*";
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);

const gapgptApiKey = process.env.GAPGPT_API_KEY;

const gapgptBaseUrl =
  process.env.GAPGPT_BASE_URL || "https://api.gapgpt.app/v1";

const gapgptModel = process.env.GAPGPT_MODEL || "gapgpt-qwen-3.6";

if (!gapgptApiKey) {
  console.warn(
    "WARNING: GAPGPT_API_KEY is not set. AI analysis will be unavailable.",
  );
}

if (isProduction && corsOrigins === "*") {
  throw new Error("CORS_ORIGINS must be explicitly configured in production");
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  port: Number(process.env.PORT) || 3000,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigins,
  gapgptApiKey,
  gapgptBaseUrl,
  gapgptModel,
};
