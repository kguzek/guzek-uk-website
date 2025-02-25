"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ForgotPasswordSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import type { User } from "@/lib/types";
import { fetchErrorToast } from "@/components/error/toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/lib/backend/schemas";
import { fetchFromApi } from "@/lib/backend/v2";
import { TRANSLATIONS } from "@/lib/translations";

export function ForgotPasswordForm({ userLanguage }: { userLanguage: Language }) {
  const data = TRANSLATIONS[userLanguage];

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutateAsync, isPending, isSuccess } = useMutation({ mutationFn: sendEmail });

  async function sendEmail(values: ForgotPasswordSchema) {
    const result = await fetchFromApi<{ message: string; token: string; user: User }>(
      "users/forgot-password",
      {
        method: "POST",
        body: values,
      },
    );
    console.info("Reset password:", result.data.message);
  }

  return (
    <Form {...form}>
      {isSuccess ? (
        <div className="grid max-w-xs gap-2 text-sm">
          <p>{data.profile.formDetails.forgotPassword.info(form.getValues("email"))}</p>
          <p>{data.profile.formDetails.verifyEmail.cta}</p>
        </div>
      ) : (
        <>
          <form
            action="/api/users/forgot-password"
            method="POST"
            className="grid w-full gap-4"
            onSubmit={form.handleSubmit((values) => {
              toast.promise(mutateAsync(values), {
                loading: `${data.profile.loading}...`,
                error: fetchErrorToast(data),
                success: data.profile.formDetails.forgotPassword.success,
              });
            })}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{data.profile.formDetails.email}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoFocus
                      autoComplete="email"
                      placeholder={data.placeholder.email}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <Button type="submit" loading={isPending}>
              {data.profile.formDetails.resetPassword.submit}
            </Button>
          </form>
          <p className="text-sm">{data.profile.formDetails.or}</p>
        </>
      )}
    </Form>
  );
}
