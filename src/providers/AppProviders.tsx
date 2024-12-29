import { ReactNode } from "react";
import { TranslationProvider } from "@/context/translation-context";
import { AuthProvider } from "@/context/auth-context";
import { FetchProvider } from "@/context/fetch-context";
import { ModalProvider } from "@/context/modal-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TranslationProvider>
      <AuthProvider>
        <ModalProvider>
          <FetchProvider>{children}</FetchProvider>
        </ModalProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}
