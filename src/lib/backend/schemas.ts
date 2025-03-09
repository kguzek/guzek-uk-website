import { z } from "zod";

function passwordsMatch(
  { password2, password }: { password2: string; password: string },
  ctx: z.RefinementCtx,
) {
  if (password2 !== password) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["password2"],
    });
  }
}

export const logInSchema = z.object({
  login: z.string().min(3),
  password: z.string().min(8),
});

export const signUpSchema = z
  .object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    password2: z.string().min(8),
    token: z.string().nonempty(),
  })
  .superRefine(passwordsMatch);

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    password2: z.string().min(8),
    token: z.string().min(1),
  })
  .superRefine(passwordsMatch);

export const updateUserDetailsSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  serverUrl: z.union([z.string().url().endsWith("/"), z.literal("")]),
});

export type LogInSchema = z.infer<typeof logInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type UpdateUserDetailsSchema = z.infer<typeof updateUserDetailsSchema>;
