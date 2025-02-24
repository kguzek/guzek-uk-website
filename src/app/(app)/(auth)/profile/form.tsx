"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { UpdateUserDetailsSchema } from "@/lib/backend/schemas";
import type { Language } from "@/lib/enums";
import type { User } from "@/lib/types";
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
import { clientToApi, refreshAccessToken } from "@/lib/backend/client2";
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
    const result = await clientToApi(`users/${user.id}`, {
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
              <FormLabel>
                {data.profile.formDetails.serverUrl}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      role="dialog"
                      className="h-min cursor-help! py-0"
                      variant="link"
                    >
                      {data.liveSeries.whatsThis}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {data.profile.formDetails.serverUrl}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
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
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Ok</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </FormLabel>
              <FormControl>
                <Input type="url" autoComplete="url" {...field} />
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
