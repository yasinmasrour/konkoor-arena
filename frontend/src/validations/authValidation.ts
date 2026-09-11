import { z } from "zod";

const phone = z
  .string()
  .regex(/^09\d{9}$/, "شماره همراه باید به شکل 09xxxxxxxxx باشد");

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "نام حداقل ۲ کاراکتر باشد"),

    lastName: z.string().min(2, "نام خانوادگی حداقل ۲ کاراکتر باشد"),

    username: z
      .string()
      .min(3, "نام کاربری حداقل ۳ کاراکتر باشد")
      .max(30, "نام کاربری حداکثر ۳۰ کاراکتر باشد")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و _ باشد",
      ),

    phoneNumber: phone,

    email: z
      .string()
      .email("فرمت ایمیل صحیح نیست")
      .optional()
      .or(z.literal("")),

    password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),

    confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),

    captchaAnswer: z.string().min(1, "حل کپچا الزامی است"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "تکرار رمز عبور با رمز عبور یکسان نیست",
  });

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "شماره همراه، ایمیل یا نام کاربری را وارد کنید"),

  password: z.string().min(1, "رمز عبور الزامی است"),

  captchaAnswer: z.string().min(1, "حل کپچا الزامی است"),
});
