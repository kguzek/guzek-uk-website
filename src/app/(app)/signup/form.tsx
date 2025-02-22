"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { SignUpSchema } from "@/lib/backend/schemas";
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
import { signUpSchema } from "@/lib/backend/schemas";
import { TRANSLATIONS } from "@/lib/translations";
import { getErrorMessage } from "@/lib/util";

export function SignUpForm({ userLanguage }: { userLanguage: Language }) {
  const router = useRouter();

  const data = TRANSLATIONS[userLanguage];
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password2: "",
    },
  });

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: (values: SignUpSchema) => signUp(values),
  });

  async function signUp(values: SignUpSchema) {
    const result = await clientToApi("auth/users", "", {
      method: "POST",
      body: values,
      // userLanguage,
    });
    if (result.ok) {
      router.push("/profile");
      router.refresh();
      router.prefetch("/liveseries");
    } else {
      throw new Error(
        result.failed
          ? "ERR_UNKNOWN"
          : getErrorMessage(result.res, result.error, data),
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
                  {error === "ERR_UNKNOWN" ? data.networkError : error}
                </p>
              ),
            }),
          });
        })}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{data.profile.formDetails.username}</FormLabel>
              <FormControl>
                <Input placeholder="jankow" {...field} />
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
              <FormLabel>{data.profile.formDetails.email}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="jan.kowalski@gmail.com"
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
                <Input type="password" {...field} />
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
              <FormLabel>{data.profile.formDetails.passwordRepeat}</FormLabel>
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
