"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { SignUpSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import { fetchErrorToast } from "@/components/error/toast";
import { fetchFromApi } from "@/lib/backend";
import { signUpSchema } from "@/lib/backend/schemas";
import { TRANSLATIONS } from "@/lib/translations";
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

export function SignUpForm({ userLanguage }: { userLanguage: Language }) {
  const data = TRANSLATIONS[userLanguage];
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
              {data.profile.formDetails.verifyEmail.header}
            </h1>
            <div className="grid gap-2 text-sm">
              <p>{data.profile.formDetails.verifyEmail.info(form.getValues("email"))}</p>
              <p>{data.profile.formDetails.verifyEmail.cta}</p>
            </div>
          </div>
          {emailClientInfo && emailVerificationPending ? (
            <Button asChild variant="ghost">
              <Link href={emailClientInfo.url} target="_blank">
                {emailClientInfo.label}
              </Link>
            </Button>
          ) : (
            <Button asChild variant={emailVerificationPending ? "disabled" : "ghost"}>
              <Link href="/login">{data.profile.formDetails.login}</Link>
            </Button>
          )}
        </>
      ) : (
        <>
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
            <Button type="submit" loading={isPending}>
              {data.profile.formDetails.signup}
            </Button>
          </form>
          <p className="text-sm">{data.profile.formDetails.haveAccountAlready}</p>
          <Button asChild variant="ghost">
            <Link href="/login">{data.profile.formDetails.login}</Link>
          </Button>
        </>
      )}
    </Form>
  );
}
