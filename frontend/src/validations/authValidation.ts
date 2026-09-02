import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),

  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),

    lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),

    email: z.string().email("ایمیل معتبر نیست"),

    password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیست",
    path: ["confirmPassword"],
  });
