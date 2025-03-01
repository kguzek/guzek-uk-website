"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import type { Language } from "@/lib/enums";
import { Tile } from "@/components/tile";
import { TRANSLATIONS } from "@/lib/translations";
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

export function SearchForm({ userLanguage }: { userLanguage: Language }) {
  const router = useRouter();
  const data = TRANSLATIONS[userLanguage];

  const form = useForm({ defaultValues: { search: "" } });

  const search = useWatch({
    control: form.control,
    name: "search",
  });

  const getSearchPath = () =>
    search === "" ? "" : `/liveseries/search/${encodeURIComponent(search)}/1`;

  const label = (
    <>
      <Search /> {data.liveSeries.search.search}
    </>
  );

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(data.liveSeries.search.title, data.liveSeries.title, false)}
      </h2>
      <div className="w-full">
        <Tile containerClassName="w-full" className="w-full items-stretch">
          <Form {...form}>
            <form
              action="/liveseries/search"
              method="GET"
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
              onSubmit={(evt) => {
                evt.preventDefault();
                router.push(getSearchPath());
              }}
            >
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{data.liveSeries.search.label}</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder={data.liveSeries.search.prompt}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.getFieldState("search").invalid ? (
                <Button disabled>{label}</Button>
              ) : (
                <Button asChild>
                  <Link href={getSearchPath()}>{label}</Link>
                </Button>
              )}
            </form>
          </Form>
        </Tile>
      </div>
    </>
  );
}
