import type { Metadata } from "next";

import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle } from "@/lib/util";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.admin.title),
  };
}

export default function AdminHome() {
  return <p>Hi, Konrad!</p>;
}
