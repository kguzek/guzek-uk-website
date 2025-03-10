"use client";

import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Info, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { UpdateUserDetailsSchema } from "@/lib/backend/schemas";
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
import { Link } from "@/i18n/navigation";
import { fetchFromApi, refreshAccessToken } from "@/lib/backend";
import { updateUserDetailsSchema } from "@/lib/backend/schemas";
import { LIVESERIES_SERVER_HOMEPAGE } from "@/lib/constants";
import { useRouter } from "@/lib/hooks/router";

export function ProfileForm({ user }: { user: User }) {
  const t = useTranslations();
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
            error: fetchErrorToast(t("networkError")),
            success: successToast(t("profile.formDetails.success")),
          }),
        )}
      >
        <input className="hidden" type="hidden" name="_method" value="PATCH" />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.formDetails.username")}</FormLabel>
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
              <FormLabel>{t("profile.formDetails.email")}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>{t("profile.formDetails.type")}</FormLabel>
          <FormControl>
            <Select value={user.role} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="user">
                    {t("profile.formDetails.regularUser")}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t("profile.formDetails.administrator")}
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
                {t("profile.formDetails.serverUrl")}
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
                        {t("profile.formDetails.serverUrl")}
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild className="space-y-3">
                        <div>
                          <p>{t("liveSeries.explanation")}</p>
                          <p>
                            {t("liveSeries.cta")}
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
        <Button
          type="submit"
          className="mx-auto w-full sm:w-fit"
          loading={isPending}
          disabled={!form.formState.isDirty}
        >
          {t("admin.contentManager.formDetails.update")} <Save />
        </Button>
      </form>
    </Form>
  );
}
