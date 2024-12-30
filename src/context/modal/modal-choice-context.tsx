"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import Modal, { ModalHandler } from "@/components/modal/modal";
import { useTranslations } from "@/context/translation-context";

export type ModalChoiceContextType = {
  modalChoice: string | undefined;
  setModalChoice: (message?: string) => Promise<boolean>;
};

const ModalChoiceContext = createContext<ModalChoiceContextType>({
  modalChoice: undefined,
  setModalChoice: async () => false,
});

export function useModalChoice() {
  const context = useContext(ModalChoiceContext);
  if (!context) {
    throw new Error("useModalChoice must be used within a ModalProvider.");
  }
  return context;
}

export function ModalChoiceProvider({ children }: { children: ReactNode }) {
  const [modalChoice, setModalChoice] = useState<string | undefined>();
  const [modalChoiceResolve, setModalChoiceResolve] = useState<ModalHandler>(
    () => () => {}
  );
  const { data } = useTranslations();

  return (
    <ModalChoiceContext.Provider
      value={{
        modalChoice,
        setModalChoice: (message) =>
          new Promise((resolve) => {
            setModalChoice(message);
            setModalChoiceResolve(() => resolve);
          }),
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
      {children}
    </ModalChoiceContext.Provider>
  );
}
