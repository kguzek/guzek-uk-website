"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import type { Language } from "@/lib/enums";
import type { ModalHandler } from "@/lib/types";
import { Modal } from "@/components/modal";
import { TRANSLATIONS } from "@/lib/translations";

export const ModalContext = createContext<{
  setModalChoice: (message?: string) => Promise<boolean>;
} | null>(null);

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider.");
  }
  return context;
}

export function ModalProvider({
  children,
  userLanguage,
}: {
  children: ReactNode;
  userLanguage: Language;
}) {
  const [modalChoice, setModalChoice] = useState<string | undefined>();
  const [onClickModalChoice, setOnClickModalChoice] = useState<
    ModalHandler | undefined
  >();
  const data = TRANSLATIONS[userLanguage];

  return (
    <ModalContext.Provider
      value={{
        setModalChoice: (message) =>
          new Promise((resolve) => {
            setModalChoice(message);
            setOnClickModalChoice(() => resolve);
          }),
      }}
    >
      <Modal
        value={modalChoice}
        labelPrimary={data.modal.yes}
        labelSecondary={data.modal.no}
        onClick={(primary) => {
          onClickModalChoice?.(primary);
          setModalChoice("");
        }}
      />
      {children}
    </ModalContext.Provider>
  );
}
