import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

export const changePasswordSchema = z.object({
  oldPassword: z
    .string({ required_error: "Old password is required" })
    .min(1, "Old password cannot be empty"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(10, "New password must be at least 10 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|;:',.<>/?~`])/,
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});
