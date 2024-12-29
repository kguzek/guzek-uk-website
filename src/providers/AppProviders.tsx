import { ReactNode } from "react";
import { TranslationProvider } from "@/context/translation-context";
import { AuthProvider } from "@/context/auth-context";
import { FetchProvider } from "@/context/fetch-context";
import { ModalProvider } from "@/context/modal-context";
import { ModalErrorProvider } from "@/context/modal/modal-error-context";
import { ModalChoiceProvider } from "@/context/modal/modal-choice-context";
import { ModalInfoProvider } from "@/context/modal/modal-info-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TranslationProvider>
      <ModalInfoProvider>
        {/* AuthProvider requires ModalInfo to be provided */}
        <AuthProvider>
          {/* ModalErrorProvider requires Auth to be provided */}
          <ModalErrorProvider>
            <ModalChoiceProvider>
              {/* ModalProvider comines the three modals into one context */}
              <ModalProvider>
                <FetchProvider>{children}</FetchProvider>
              </ModalProvider>
            </ModalChoiceProvider>
          </ModalErrorProvider>
        </AuthProvider>
      </ModalInfoProvider>
    </TranslationProvider>
  );
}
