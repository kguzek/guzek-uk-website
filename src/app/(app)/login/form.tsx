"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { LogInSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
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
import { clientToApi } from "@/lib/backend/client";
import { logInSchema } from "@/lib/backend/schemas";
import { TRANSLATIONS } from "@/lib/translations";

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

  async function login(values: LogInSchema) {
    const result = await clientToApi("auth/tokens", "", {
      method: "POST",
      body: values,
    });
    if (result.ok) {
      router.push("/profile");
      router.refresh();
      router.prefetch("/liveseries");
    } else {
      throw new Error(
        result.failed ? "ERR_UNKNOWN" : "ERR_INVALID_CREDENTIALS",
      );
    }
  }

  return (
    <Form {...form}>
      <form
        action="https://auth.guzek.uk/auth/tokens"
        method="POST"
        className="grid gap-4"
        onSubmit={form.handleSubmit(() => {
          toast.promise(mutateAsync(form.getValues()), {
            loading: `${data.profile.loading}...`,
            error: (error) => ({
              icon: <CircleAlert className="text-error not-first:hidden" />,
              message: (
                <p className="ml-2">
                  {error === "ERR_UNKNOWN"
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
