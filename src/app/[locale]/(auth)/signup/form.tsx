"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Turnstile } from "next-turnstile";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { SignUpSchema } from "@/lib/backend/schemas";
import { createNewUser } from "@/app/actions";
import { fetchErrorToast } from "@/components/error/toast";
import { ClientLink } from "@/components/link/client";
import { useRouter } from "@/i18n/navigation";
import { signUpSchema } from "@/lib/backend/schemas";
import { TURNSTILE_SITE_KEY } from "@/lib/constants";
import { beginEmailVerification } from "@/lib/util";
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
  const router = useRouter();
  const locale = useLocale();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password2: "",
      token: "",
    },
  });

  const { mutateAsync, isPending } = useMutation({ mutationFn: signUp });

  async function signUp(values: SignUpSchema) {
    const result = await createNewUser(values);
    console.info("Created new user:", result);
    beginEmailVerification(values.email);
    router.push("/login");
  }

  return (
    <Form {...form}>
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
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          appearance="interaction-only"
          className="min-h-7.5"
          onError={(error) => {
            console.error("Error from Turnstile:", error);
            toast.error(`${t("unknownError")}. ERR_CF_TUR_01`, { duration: 10300 });
          }}
          onVerify={(token) => {
            form.setValue("token", token);
          }}
          onExpire={() => {
            form.setValue("token", "");
          }}
          language={locale}
        />
        <Button type="submit" loading={isPending}>
          {t("profile.formDetails.signup")}
        </Button>
      </form>
      <p className="text-sm">{t("profile.formDetails.haveAccountAlready")}</p>
      <Button asChild variant="ghost">
        <ClientLink href="/login">{t("profile.formDetails.login")}</ClientLink>
      </Button>
    </Form>
  );
}
