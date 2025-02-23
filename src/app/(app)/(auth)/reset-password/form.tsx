"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ResetPasswordSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import { toastError } from "@/components/error/toast";
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
import { clientToApi } from "@/lib/backend/client2";
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
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: resetPassword,
  });

  async function resetPassword(values: ResetPasswordSchema) {
    const result = await clientToApi("users/reset-password", {
      method: "POST",
      body: values,
    });
    console.info("Reset password:", result);
    router.push("/profile");
    router.prefetch("/liveseries");
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
            error: toastError(data),
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
                <Input autoFocus type="password" {...field} />
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
        <Button type="submit" loading={isPending}>
          {data.profile.formDetails.resetPassword.submit}
        </Button>
      </form>
    </Form>
  );
}
