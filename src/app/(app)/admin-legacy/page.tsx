import type { Metadata } from "next";

import { getTitle } from "@/lib/util";
import { getTranslations } from "@/providers/translation-provider";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.admin.title),
  };
}

export default function AdminHome() {
  return <p>Hi, Konrad!</p>;
}
