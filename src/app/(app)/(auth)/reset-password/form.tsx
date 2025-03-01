"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ResetPasswordSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import type { ApiMessage } from "@/lib/types";
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
import { fetchFromApi } from "@/lib/backend";
import { resetPasswordSchema } from "@/lib/backend/schemas";
import { TRANSLATIONS } from "@/lib/translations";

export function ResetPasswordForm({
  token,
  userLanguage,
}: {
  token: string;
  userLanguage: Language;
}) {
  const data = TRANSLATIONS[userLanguage];
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      password2: "",
    },
  });

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: resetPassword,
  });

  async function resetPassword({ token, password, password2 }: ResetPasswordSchema) {
    const result = await fetchFromApi<ApiMessage>("users/reset-password", {
      method: "POST",
      body: { token, password, "confirm-password": password2 },
    });
    console.info("Reset password :", result);
    if (!result.data.message?.includes("successfully")) {
      console.warn("Response didn't contain success message");
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        method="POST"
        action="/api/users/reset-password"
        className="grid w-full gap-4"
        onSubmit={form.handleSubmit((values) => {
          toast.promise(mutateAsync(values), {
            loading: `${data.profile.loading}...`,
            error: fetchErrorToast(data),
            success: data.profile.formDetails.resetPassword.success,
          });
        })}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{data.profile.formDetails.resetPassword.field}</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="password2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{data.profile.formDetails.passwordRepeat}</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="token"
          render={() => <div className="hidden" />}
        ></FormField>
        <Button type="submit" loading={isPending} disabled={isSuccess}>
          {data.profile.formDetails.resetPassword.submit}
        </Button>
      </form>
    </Form>
  );
}
