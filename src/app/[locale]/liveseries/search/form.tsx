"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";

import { Tile } from "@/components/tile";
import { getTitle } from "@/lib/util";
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

export function SearchForm() {
  const router = useRouter();
  const t = useTranslations();

  const form = useForm({ defaultValues: { search: "" } });

  const search = useWatch({
    control: form.control,
    name: "search",
  });

  const getSearchPath = (search: string) =>
    search === "" ? "" : `/liveseries/search/${encodeURIComponent(search)}/1`;

  const label = (
    <>
      <Search /> {t("liveSeries.search.search")}
    </>
  );

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(t("liveSeries.search.title"), t("liveSeries.title"))}
      </h2>
      <div className="w-full">
        <Tile containerClassName="w-full" className="w-full items-stretch">
          <Form {...form}>
            <form
              action="/liveseries/search"
              method="GET"
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
              onSubmit={form.handleSubmit((values) => {
                router.push(getSearchPath(values.search));
              })}
            >
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("liveSeries.search.label")}</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder={t("liveSeries.search.prompt")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {search ? (
                <Button asChild>
                  <Link href={getSearchPath(search)}>{label}</Link>
                </Button>
              ) : (
                <Button>{label}</Button>
              )}
            </form>
          </Form>
        </Tile>
      </div>
    </>
  );
}
