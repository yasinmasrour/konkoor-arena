const { z } = require("zod");

const phoneSchema = z.string().trim().regex(/^09\d{9}$/, "شماره همراه باید به شکل 09xxxxxxxxx باشد");

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  phoneNumber: phoneSchema,
  password: z.string().min(6).max(72),
});

const loginSchema = z.object({
  identifier: z.string().min(3, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
  captchaToken: z.string().min(1, "Captcha token is required"),
  captchaAnswer: z.string().min(1, "Captcha answer is required"),
});

const verificationSchema = z.object({
  phoneNumber: phoneSchema,
  code: z.string().trim().regex(/^\d{6}$/, "کد تایید باید ۶ رقمی باشد"),
});

module.exports = { registerSchema, loginSchema, verificationSchema, phoneSchema };
