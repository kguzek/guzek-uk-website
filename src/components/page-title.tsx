import Head from "next/head";
import { getTitle } from "@/lib/util";

export function PageTitle({ title }: { title: string }) {
  return (
    <Head>
      <title>{getTitle(title)}</title>
    </Head>
  );
}
