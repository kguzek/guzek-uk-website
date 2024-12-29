import { createContext, ReactNode, useContext, useState } from "react";
import Modal from "@/components/modal/modal";
import { clearStoredLoginInfo } from "@/lib/backend";
import { useAuth } from "../auth-context";

export type ModalErrorContextType = {
  modalError: string | undefined;
  setModalError: (message?: string) => void;
};

const ModalErrorContext = createContext<ModalErrorContextType>({
  modalError: undefined,
  setModalError: () => {},
});

export function useModalError() {
  const context = useContext(ModalErrorContext);
  if (!context) {
    throw new Error("useModalError must be used within a ModalProvider.");
  }
  return context;
}

export function ModalErrorProvider({ children }: { children: ReactNode }) {
  const [modalError, setModalError] = useState<string | undefined>();
  const { logout } = useAuth();

  return (
    <ModalErrorContext.Provider
      value={{
        modalError,
        setModalError: (value?: string) => {
          if (value === '{"401 Unauthorised":"Missing authorisation token."}') {
            clearStoredLoginInfo();
            logout();
          }
          setModalError(value);
        },
      }}
    >
      <Modal
        className="error"
        value={modalError}
        onClick={() => setModalError("")}
      />
      {children}
    </ModalErrorContext.Provider>
  );
}
