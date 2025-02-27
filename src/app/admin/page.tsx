import { getTitle } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.admin.title),
  };
}

export default function AdminHome() {
  return <p>Hi, Konrad!</p>;
}
