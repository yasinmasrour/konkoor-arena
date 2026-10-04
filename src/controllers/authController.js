const authService = require("../services/authService");
const recoveryService = require("../services/recoveryService");
const { createCaptcha, verifyCaptcha } = require("../services/captchaService");

// ============================================================
// SMS / OTP AUTH — TEMPORARILY DISABLED
// ============================================================
// SMS verification is intentionally disabled for now.
// The original services are kept in the project so that
// SMS/OTP authentication can be re-enabled later.
//
// const { issueVerificationCode } = require("../services/verificationService");
// const { normalizePhoneNumber } = require("../services/smsService");
// ============================================================

const asyncHandler = require("../utils/asyncHandler");

const captcha = asyncHandler(async (req, res) => {
  res.status(200).json(createCaptcha());
});

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);

  res.status(201).json({
    message: "Registration successful",
    ...result,
  });
});

/*
 * ============================================================
 * SMS / OTP REGISTRATION VERIFICATION — DISABLED
 * ============================================================
 *
 * This endpoint is intentionally kept commented out so that
 * SMS verification can be restored later if needed.
 *
const verifyRegistration = asyncHandler(async (req, res) => {
  const result = await authService.verifyRegistration(
    req.body.phoneNumber,
    req.body.code,
  );

  res.status(200).json({
    message: "Phone verified successfully",
    ...result,
  });
});
 * ============================================================
 */

const login = asyncHandler(async (req, res) => {
  // CAPTCHA remains enabled for login.
  verifyCaptcha(req.body.captchaToken, req.body.captchaAnswer);

  const result = await authService.loginUser(
    req.body.identifier,
    req.body.password,
  );

  res.status(200).json({
    message: "Login successful",
    ...result,
  });
});

/*
 * ============================================================
 * SMS / OTP LOGIN VERIFICATION — DISABLED
 * ============================================================
 *
 * This endpoint is intentionally kept commented out so that
 * SMS verification can be restored later if needed.
 *
const verifyLogin = asyncHandler(async (req, res) => {
  const result = await authService.verifyLogin(
    req.body.phoneNumber,
    req.body.code,
  );

  res.status(200).json({
    message: "Login successful",
    ...result,
  });
});
 * ============================================================
 */

/*
 * ============================================================
 * SMS / OTP RESEND — DISABLED
 * ============================================================
 *
 * This endpoint is intentionally kept commented out so that
 * SMS verification can be restored later if needed.
 *
const resendCode = asyncHandler(async (req, res) => {
  const phone = normalizePhoneNumber(req.body.phoneNumber);

  const purpose =
    req.body.purpose === "PHONE_LOGIN"
      ? "PHONE_LOGIN"
      : "PHONE_REGISTRATION";

  await issueVerificationCode({
    phoneNumber: phone,
    purpose,
  });

  res.status(200).json({
    message: "Verification code sent",
  });
});
 * ============================================================
 */

// ============================================================
// 🆕 SECURITY RECOVERY — SETUP (authenticated)
// ============================================================

const setupSecurity = asyncHandler(async (req, res) => {
  const result = await recoveryService.setupSecurityRecovery(
    req.user.id,
    req.body.question,
    req.body.answer,
  );

  res.status(200).json({
    message: "Security recovery setup successfully",
    recoveryCode: result.recoveryCode,
    question: result.question,
    questionText: result.questionText,
  });
});

// ============================================================
// 🆕 SECURITY RECOVERY — STATUS (authenticated)
// ============================================================

const getRecoveryStatus = asyncHandler(async (req, res) => {
  const status = await recoveryService.getRecoveryStatus(req.user.id);
  res.status(200).json(status);
});

// ============================================================
// 🆕 FORGOT PASSWORD — STEP 1 (lookup question)
// ============================================================

const forgotPasswordLookup = asyncHandler(async (req, res) => {
  const result = await recoveryService.getSecurityQuestionForUser(
    req.body.identifier,
  );
  res.status(200).json(result);
});

// ============================================================
// 🆕 FORGOT PASSWORD — با سوال امنیتی
// ============================================================

const resetPasswordWithQuestion = asyncHandler(async (req, res) => {
  await recoveryService.resetPasswordWithQuestion(
    req.body.identifier,
    req.body.answer,
    req.body.newPassword,
  );

  res.status(200).json({
    message: "Password reset successfully",
  });
});

// ============================================================
// 🆕 FORGOT PASSWORD — با کد بازیابی
// ============================================================

const resetPasswordWithRecoveryCode = asyncHandler(async (req, res) => {
  await recoveryService.resetPasswordWithRecoveryCode(
    req.body.identifier,
    req.body.code,
    req.body.newPassword,
  );

  res.status(200).json({
    message: "Password reset successfully",
  });
});

module.exports = {
  captcha,
  register,
  login,

  // 🆕
  setupSecurity,
  getRecoveryStatus,
  forgotPasswordLookup,
  resetPasswordWithQuestion,
  resetPasswordWithRecoveryCode,

  // SMS/OTP handlers are intentionally disabled for now.
  // verifyRegistration,
  // verifyLogin,
  // resendCode,
};