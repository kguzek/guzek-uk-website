import type { ReactNode } from "react";
import { useTranslations } from "@/providers/translation-provider";
import { ModalProvider } from "./modal-context";

export async function ModalProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { userLanguage } = await useTranslations();
  return <ModalProvider userLanguage={userLanguage}>{children}</ModalProvider>;
}
