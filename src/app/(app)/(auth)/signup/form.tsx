"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { SignUpSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import { toastError } from "@/components/error/toast";
import { clientToApi } from "@/lib/backend/client2";
import { signUpSchema } from "@/lib/backend/schemas";
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

  const { mutateAsync, isPending, isSuccess } = useMutation({ mutationFn: signUp });

  async function signUp(values: SignUpSchema) {
    const result = await clientToApi("users", {
      method: "POST",
      body: values,
      useCredentials: true,
      // userLanguage,
    });
    console.info("Created new user:", result);
    router.push("/profile");
    router.prefetch("/liveseries");
  }

  return (
    <Form {...form}>
      {isSuccess ? (
        <div className="grid max-w-xs gap-4">
          <h1 className="text-xl font-bold">
            {data.profile.formDetails.verifyEmail.header}
          </h1>
          <div className="text-sm">
            <p>{data.profile.formDetails.verifyEmail.info(form.getValues("email"))}</p>
            <p>{data.profile.formDetails.verifyEmail.cta}</p>
          </div>
        </div>
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
                error: toastError(data),
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
                    <Input placeholder={data.placeholder.username} {...field} />
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
                    <Input type="email" placeholder={data.placeholder.email} {...field} />
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
            <Button type="submit" className="btn btn-submit" loading={isPending}>
              {data.profile.formDetails.login}
            </Button>
          </form>
          <p className="text-sm">{data.profile.formDetails.haveAccountAlready}</p>
        </>
      )}
      <Button asChild variant="ghost">
        <Link href="/login">{data.profile.formDetails.login}</Link>
      </Button>
    </Form>
  );
}
