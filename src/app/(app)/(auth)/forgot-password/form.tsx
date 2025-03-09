"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { ForgotPasswordSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import { forgotPassword } from "@/app/actions";
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
import { TRANSLATIONS } from "@/lib/translations";
import { getEmailClientInfo } from "@/lib/util";

export function ForgotPasswordForm({ userLanguage }: { userLanguage: Language }) {
  const data = TRANSLATIONS[userLanguage];
  const [passwordResetPending, setPasswordResetPending] = useState(true);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutateAsync, isPending, isSuccess } = useMutation({ mutationFn: sendEmail });

  async function sendEmail(values: ForgotPasswordSchema) {
    const success = await forgotPassword(values);
    if (!success) {
      throw new Error(`${data.unknownError} ERR_FP_SUC_FLS`);
    }

    setTimeout(() => {
      setPasswordResetPending(false);
    }, 10000);

    return success;
  }

  const email = useWatch({
    control: form.control,
    name: "email",
  });

  const emailClientInfo = getEmailClientInfo(email);

  return (
    <Form {...form}>
      {isSuccess ? (
        <div className="grid max-w-xs gap-2 text-sm">
          <p>{data.profile.formDetails.forgotPassword.info(email)}</p>
          <p>{data.profile.formDetails.verifyEmail.cta}</p>

          {emailClientInfo && passwordResetPending ? (
            <Button asChild variant="ghost">
              <Link href={emailClientInfo.url} target="_blank">
                {emailClientInfo.label}
              </Link>
            </Button>
          ) : (
            <Button asChild variant={passwordResetPending ? "disabled" : "ghost"}>
              <Link href="/login">{data.profile.formDetails.login}</Link>
            </Button>
          )}
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
          <Button variant="ghost" asChild>
            <Link href="/login">{data.profile.formDetails.login}</Link>
          </Button>
        </>
      )}
    </Form>
  );
}
