"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { UpdateUserDetailsSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import type { User } from "@/payload-types";
import { fetchErrorToast } from "@/components/error/toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { successToast } from "@/components/ui/sonner";
import { fetchFromApi, refreshAccessToken } from "@/lib/backend";
import { updateUserDetailsSchema } from "@/lib/backend/schemas";
import { LIVESERIES_SERVER_HOMEPAGE } from "@/lib/constants";
import { TRANSLATIONS } from "@/lib/translations";

export function ProfileForm({
  user,
  userLanguage,
}: {
  user: User;
  userLanguage: Language;
}) {
  const data = TRANSLATIONS[userLanguage];
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusServerUrl = searchParams.get("focus") === "serverUrl";
  const serverUrlInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync, isPending } = useMutation({ mutationFn: updateUser });

  const form = useForm({
    resolver: zodResolver(updateUserDetailsSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      serverUrl: user.serverUrl ?? "",
    },
  });

  async function updateUser(values: UpdateUserDetailsSchema) {
    if (!user) return;
    const result = await fetchFromApi(`users/${user.id}`, {
      method: "PATCH",
      body: values,
    });
    console.info("Updated user details:", result);
    await refreshAccessToken();
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        action={`/api/users/${user.id}`}
        method="POST"
        className="grid w-full gap-4"
        onSubmit={form.handleSubmit((values) =>
          toast.promise(mutateAsync(values), {
            error: fetchErrorToast(data),
            success: successToast(data.profile.formDetails.success),
          }),
        )}
      >
        <input className="hidden" type="hidden" name="_method" value="PATCH" />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{data.profile.formDetails.username}</FormLabel>
              <FormControl>
                <Input autoComplete="username" {...field} />
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
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>{data.profile.formDetails.type}</FormLabel>
          <FormControl>
            <Select value={user.role} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="user">
                    {data.profile.formDetails.regularUser}
                  </SelectItem>
                  <SelectItem value="admin">
                    {data.profile.formDetails.administrator}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
        <FormField
          control={form.control}
          name="serverUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {data.profile.formDetails.serverUrl}
                <AlertDialog defaultOpen={focusServerUrl}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      role="dialog"
                      className="h-min cursor-help! items-center p-0"
                      variant="link"
                    >
                      <Info />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    onCloseAutoFocus={(event_) => {
                      event_.preventDefault();
                      if (serverUrlInputRef.current && focusServerUrl) {
                        serverUrlInputRef.current.focus();
                      }
                    }}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {data.profile.formDetails.serverUrl}
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild className="space-y-3">
                        <div>
                          <p>{data.liveSeries.explanation}</p>
                          <p>
                            {data.liveSeries.cta}
                            <Link
                              className="hover-underline"
                              href={LIVESERIES_SERVER_HOMEPAGE}
                            >
                              {LIVESERIES_SERVER_HOMEPAGE}
                            </Link>
                            .
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">Ok</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  autoComplete="url"
                  {...field}
                  ref={(element) => {
                    field.ref(element);
                    serverUrlInputRef.current = element;
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={isPending}>
          {data.admin.contentManager.formDetails.update}
        </Button>
      </form>
    </Form>
  );
}
