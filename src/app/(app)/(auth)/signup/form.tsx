"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Turnstile } from "next-turnstile";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { SignUpSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import { createNewUser } from "@/app/actions";
import { fetchErrorToast } from "@/components/error/toast";
import { signUpSchema } from "@/lib/backend/schemas";
import { TURNSTILE_SITE_KEY } from "@/lib/constants";
import { TRANSLATIONS } from "@/lib/translations";
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

export function SignUpForm({ userLanguage }: { userLanguage: Language }) {
  const data = TRANSLATIONS[userLanguage];
  const router = useRouter();

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
      <h1 className="text-xl font-bold">{data.profile.formDetails.signup}</h1>
      <form
        action="/api/users"
        method="POST"
        className="grid w-full gap-4"
        onSubmit={form.handleSubmit((values) => {
          toast.promise(mutateAsync(values), {
            loading: `${data.profile.loading}...`,
            error: fetchErrorToast(data),
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
                <Input
                  autoComplete="username"
                  autoFocus
                  placeholder={data.placeholder.username}
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
              <FormLabel>{data.profile.formDetails.email}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
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
              <FormLabel>{data.profile.formDetails.passwordRepeat}</FormLabel>
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
            toast.error(`${data.unknownError}. ERR_CF_TUR_01`, { duration: 10300 });
          }}
          onVerify={(token) => {
            form.setValue("token", token);
          }}
          onExpire={() => {
            form.setValue("token", "");
          }}
          language={userLanguage}
        />
        <Button type="submit" loading={isPending}>
          {data.profile.formDetails.signup}
        </Button>
      </form>
      <p className="text-sm">{data.profile.formDetails.haveAccountAlready}</p>
      <Button asChild variant="ghost">
        <Link href="/login">{data.profile.formDetails.login}</Link>
      </Button>
    </Form>
  );
}
