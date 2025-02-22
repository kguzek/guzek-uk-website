import { z } from "zod";

export const logInSchema = z.object({
  login: z.string().min(3),
  password: z.string().min(8),
});

export type LogInSchema = z.infer<typeof logInSchema>;

export const signUpSchema = z
  .object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    password2: z.string().min(8),
  })
  .superRefine(({ password2, password }, ctx) => {
    if (password2 !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["password2"],
      });
    }
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
