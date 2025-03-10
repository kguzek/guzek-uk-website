"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { LogInSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import { fetchErrorToast } from "@/components/error/toast";
import { showSuccessToast } from "@/components/ui/sonner";
import { fetchFromApi } from "@/lib/backend";
import { logInSchema } from "@/lib/backend/schemas";
import { TRANSLATIONS } from "@/lib/translations";
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LogInForm({
  userLanguage,
  from,
}: {
  userLanguage: Language;
  from?: string;
}) {
  const router = useRouter();
  const form = useForm<LogInSchema>({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });
  const { mutateAsync, isPending, isSuccess } = useMutation({ mutationFn: login });

  const data = TRANSLATIONS[userLanguage];

  async function login({ login, password }: LogInSchema) {
    const data = EMAIL_REGEX.test(login) ? { email: login } : { username: login };
    const result = await fetchFromApi("users/login", {
      method: "POST",
      body: { ...data, password },
    });
    console.info("Logged in:", result);
    router.push("/profile");
    router.refresh();
  }

  useEffect(() => {
    if (from === "verify-email") {
      showSuccessToast(data.profile.formDetails.verifyEmail.success);
    }
  }, [from]);

  return (
    <Form {...form}>
      <form
        action="/api/users/login"
        method="POST"
        className="grid w-full gap-4"
        onSubmit={form.handleSubmit((values) => {
          toast.promise(mutateAsync(values), {
            loading: `${data.profile.loading}...`,
            error: fetchErrorToast(data, data.profile.invalidCredentials),
          });
        })}
      >
        <FormField
          control={form.control}
          name="login"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{data.profile.formDetails.loginPrompt}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  autoFocus
                  placeholder={data.placeholder.email}
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
              <FormLabel>{data.profile.formDetails.password}</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Link
          className="group ml-auto flex w-fit items-center gap-2 text-sm"
          href="/forgot-password"
        >
          <KeyRound size={16} />
          <span className="hover-underline group-hover:underlined">
            {data.profile.formDetails.forgotPassword.header}?
          </span>
        </Link>
        <Button type="submit" loading={isPending} disabled={isSuccess}>
          {data.profile.formDetails.login}
        </Button>
      </form>
    </Form>
  );
}
