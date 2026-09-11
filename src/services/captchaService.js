const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const AppError = require("../utils/appError");

const createCaptcha = () => {
  const a = crypto.randomInt(1, 10);
  const b = crypto.randomInt(1, 10);
  const operation = crypto.randomInt(0, 2) === 0 ? "+" : "-";
  const answer = operation === "+" ? a + b : Math.max(a, b) - Math.min(a, b);
  const left = operation === "+" ? a : Math.max(a, b);
  const right = operation === "+" ? b : Math.min(a, b);
  const question = `${left} ${operation} ${right} = ?`;
  const answerHash = crypto.createHash("sha256").update(`${answer}:${jwtSecret}`).digest("hex");

  const token = jwt.sign({ type: "captcha", answerHash }, jwtSecret, { expiresIn: "5m" });
  return { token, question };
};

const verifyCaptcha = (token, answer) => {
  if (!token || answer === undefined || answer === null || String(answer).trim() === "") {
    throw new AppError("CAPTCHA is required", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch {
    throw new AppError("CAPTCHA expired or invalid", 400);
  }

  if (decoded.type !== "captcha") {
    throw new AppError("CAPTCHA is invalid", 400);
  }

  const normalizedAnswer = String(answer).trim();
  const answerHash = crypto.createHash("sha256").update(`${normalizedAnswer}:${jwtSecret}`).digest("hex");
  if (answerHash !== decoded.answerHash) {
    throw new AppError("CAPTCHA answer is incorrect", 400);
  }

  return true;
};

module.exports = { createCaptcha, verifyCaptcha };
