"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { LogInSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import { clientToApi, NetworkError } from "@/lib/backend/client2";
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

export function LogInForm({ userLanguage }: { userLanguage: Language }) {
  const router = useRouter();
  const form = useForm<LogInSchema>({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });
  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: (values: LogInSchema) => login(values),
  });

  const data = TRANSLATIONS[userLanguage];

  async function login({ login, password }: LogInSchema) {
    const data = EMAIL_REGEX.test(login)
      ? { email: login }
      : { username: login };
    const result = await clientToApi("users/login", {
      method: "POST",
      body: { ...data, password },
    });
    console.info("Logged in:", result);
    router.push("/profile");
    router.prefetch("/liveseries");
  }

  return (
    <Form {...form}>
      <form
        action="TODO: nojs-login"
        method="POST"
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => {
          toast.promise(mutateAsync(values), {
            loading: `${data.profile.loading}...`,
            error: (error) => ({
              icon: <CircleAlert className="text-error not-first:hidden" />,
              message: (
                <p className="ml-2">
                  {error instanceof NetworkError
                    ? data.networkError
                    : data.profile.invalidCredentials}
                </p>
              ),
            }),
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
                <Input placeholder="jan.kowalski@gmail.com" {...field} />
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
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="btn btn-submit"
          loading={isPending}
          disabled={isSuccess}
        >
          {data.profile.formDetails.login}
        </Button>
      </form>
    </Form>
  );
}
