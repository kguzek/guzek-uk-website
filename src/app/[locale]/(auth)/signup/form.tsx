"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { SignUpSchema } from "@/lib/backend/schemas";
import { fetchErrorToast } from "@/components/error/toast";
import { ClientLink } from "@/components/link/client";
import { fetchFromApi } from "@/lib/backend";
import { signUpSchema } from "@/lib/backend/schemas";
import { getEmailClientInfo } from "@/lib/util";
import { Button } from "@/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/form";
import { Input } from "@/ui/input";

export function SignUpForm() {
  const t = useTranslations();
  const [emailVerificationPending, setEmailVerificationPending] = useState(true);

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password2: "",
    },
  });

  const { mutateAsync, isPending, isSuccess } = useMutation({ mutationFn: signUp });

  async function signUp(values: SignUpSchema) {
    const result = await fetchFromApi("users", {
      method: "POST",
      body: values,
    });
    console.info("Created new user:", result);

    setTimeout(() => {
      setEmailVerificationPending(false);
    }, 10000);
  }

  const email = useWatch({
    control: form.control,
    name: "email",
  });

  const emailClientInfo = getEmailClientInfo(email);

  return (
    <Form {...form}>
      {isSuccess ? (
        <>
          <div className="grid max-w-xs gap-4">
            <h1 className="text-xl font-bold">
              {t("profile.formDetails.verifyEmail.header")}
            </h1>
            <div className="grid gap-2 text-sm">
              <p>{t("profile.formDetails.verifyEmail.info", { email })}</p>
              <p>{t("profile.formDetails.verifyEmail.cta")}</p>
            </div>
          </div>
          {emailClientInfo && emailVerificationPending ? (
            <Button asChild variant="ghost">
              <ClientLink href={emailClientInfo.url} target="_blank">
                {emailClientInfo.label}
              </ClientLink>
            </Button>
          ) : (
            <Button asChild variant={emailVerificationPending ? "disabled" : "ghost"}>
              <ClientLink href="/login">{t("profile.formDetails.login")}</ClientLink>
            </Button>
          )}
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold">{t("profile.formDetails.signup")}</h1>
          <form
            action="/api/users"
            method="POST"
            className="grid w-full gap-4"
            onSubmit={form.handleSubmit((values) => {
              toast.promise(mutateAsync(values), {
                loading: `${t("profile.loading")}...`,
                error: fetchErrorToast(t("networkError")),
              });
            })}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.formDetails.username")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="username"
                      autoFocus
                      placeholder={t("placeholder.username")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.formDetails.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder={t("placeholder.email")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.formDetails.password")}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.formDetails.passwordRepeat")}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={isPending}>
              {t("profile.formDetails.signup")}
            </Button>
          </form>
          <p className="text-sm">{t("profile.formDetails.haveAccountAlready")}</p>
          <Button asChild variant="ghost">
            <ClientLink href="/login">{t("profile.formDetails.login")}</ClientLink>
          </Button>
        </>
      )}
    </Form>
  );
}
