import { createContext, ReactNode, useContext, useState } from "react";
import Modal, { ModalHandler } from "@/components/modal/modal";
import { useTranslations } from "@/context/translation-context";
import { clearStoredLoginInfo } from "@/lib/backend";

export const ModalContext = createContext<{
  setModalInfo: (message?: string) => void;
  setModalError: (message?: string) => void;
  setModalChoice: (message?: string) => Promise<boolean>;
}>({
  setModalInfo: () => {},
  setModalError: () => {},
  setModalChoice: async () => false,
});

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider.");
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalInfo, setModalInfo] = useState<string | undefined>();
  const [modalError, setModalError] = useState<string | undefined>();
  const [modalChoice, setModalChoice] = useState<string | undefined>();
  const [modalChoiceResolve, setModalChoiceResolve] = useState<ModalHandler>(
    () => () => {}
  );
  const { data } = useTranslations();

  return (
    <ModalContext.Provider
      value={{
        setModalInfo,
        setModalError: (value?: string) => {
          if (value === '{"401 Unauthorised":"Missing authorisation token."}') {
            clearStoredLoginInfo();
            logout();
          }
          setModalError(value);
        },
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
      <Modal value={modalInfo} onClick={() => setModalInfo("")} />
      <Modal
        className="error"
        value={modalError}
        onClick={() => setModalError("")}
      />
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
    </ModalContext.Provider>
  );
}
