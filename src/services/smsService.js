const AppError = require("../utils/appError");

const normalizePhoneNumber = (value) => {
  const raw = String(value || "").trim().replace(/[\s-]/g, "");
  if (raw.startsWith("+98")) return `0${raw.slice(3)}`;
  if (raw.startsWith("0098")) return `0${raw.slice(4)}`;
  if (raw.startsWith("98") && raw.length === 12) return `0${raw.slice(2)}`;
  return raw;
};

const isValidIranMobile = (value) => /^09\d{9}$/.test(normalizePhoneNumber(value));

const sendSmsVerificationCode = async ({ phoneNumber, code }) => {
  const phone = normalizePhoneNumber(phoneNumber);
  const mode = (process.env.SMS_MODE || "console").toLowerCase();

  if (mode === "console") {
    console.log(`[SMS:console] Verification code for ${phone}: ${code}`);
    return { delivered: true, mode: "console" };
  }

  if (mode === "kavenegar") {
    const apiKey = process.env.KAVENEGAR_API_KEY;
    const template = process.env.KAVENEGAR_VERIFY_TEMPLATE;

    if (!apiKey || !template) {
      throw new AppError("SMS provider is not configured", 500);
    }

    const url = new URL(`https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`);
    url.searchParams.set("receptor", phone);
    url.searchParams.set("token", code);
    url.searchParams.set("template", template);

    const response = await fetch(url);
    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.return?.status !== 200) {
      throw new AppError("Could not send verification code", 502);
    }

    return { delivered: true, mode: "kavenegar" };
  }

  throw new AppError("Unsupported SMS provider", 500);
};

module.exports = {
  normalizePhoneNumber,
  isValidIranMobile,
  sendSmsVerificationCode,
};
