const authService = require("../services/authService");
const { createCaptcha, verifyCaptcha } = require("../services/captchaService");
const { issueVerificationCode } = require("../services/verificationService");
const { normalizePhoneNumber } = require("../services/smsService");
const asyncHandler = require("../utils/asyncHandler");

const captcha = asyncHandler(async (req, res) => {
  res.status(200).json(createCaptcha());
});

const register = asyncHandler(async (req, res) => {
  verifyCaptcha(req.body.captchaToken, req.body.captchaAnswer);
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    message: "Verification code sent",
    ...result,
  });
});

const verifyRegistration = asyncHandler(async (req, res) => {
  const result = await authService.verifyRegistration(
    req.body.phoneNumber,
    req.body.code,
  );
  res.status(200).json({ message: "Phone verified successfully", ...result });
});

const login = asyncHandler(async (req, res) => {
  verifyCaptcha(req.body.captchaToken, req.body.captchaAnswer);
  const result = await authService.loginUser(
    req.body.identifier,
    req.body.password,
  );
  res.status(200).json({ message: "Verification code sent", ...result });
});

const verifyLogin = asyncHandler(async (req, res) => {
  const result = await authService.verifyLogin(
    req.body.phoneNumber,
    req.body.code,
  );
  res.status(200).json({ message: "Login successful", ...result });
});

const resendCode = asyncHandler(async (req, res) => {
  const phone = normalizePhoneNumber(req.body.phoneNumber);
  const purpose =
    req.body.purpose === "PHONE_LOGIN" ? "PHONE_LOGIN" : "PHONE_REGISTRATION";
  await issueVerificationCode({ phoneNumber: phone, purpose });
  res.status(200).json({ message: "Verification code sent" });
});

module.exports = {
  captcha,
  register,
  verifyRegistration,
  login,
  verifyLogin,
  resendCode,
};
