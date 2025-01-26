"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { Modal, ModalHandler } from "@/components/modal";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";

export const ModalContext = createContext<{
  modalChoice: string | undefined;
  setModalChoice: (message?: string) => Promise<boolean>;
  modalError: string | undefined;
  setModalError: (message?: string) => void;
  modalInfo: string | undefined;
  setModalInfo: (message?: string) => void;
}>({
  modalChoice: undefined,
  setModalChoice: async () => false,
  modalError: undefined,
  setModalError: () => {},
  modalInfo: undefined,
  setModalInfo: () => {},
});

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
  const [modalChoiceResolve, setModalChoiceResolve] = useState<ModalHandler>(
    () => () => {},
  );
  const [modalError, setModalError] = useState<string | undefined>();
  const [modalInfo, setModalInfo] = useState<string | undefined>();
  const data = TRANSLATIONS[userLanguage];

  return (
    <ModalContext.Provider
      value={{
        modalChoice,
        setModalChoice: (message) =>
          new Promise((resolve) => {
            setModalChoice(message);
            setModalChoiceResolve(() => resolve);
          }),
        modalError,
        setModalError,
        modalInfo,
        setModalInfo,
      }}
    >
      <Modal
        value={modalChoice}
        labelPrimary={data.modal.yes}
        labelSecondary={data.modal.no}
        onClick={(primary) => {
          modalChoiceResolve(primary);
          setModalChoice("");
        }}
      />
      <Modal
        variant="error"
        value={modalError}
        onClick={() => setModalError("")}
      />
      <Modal value={modalInfo} onClick={() => setModalInfo("")} />
      {children}
    </ModalContext.Provider>
  );
}
