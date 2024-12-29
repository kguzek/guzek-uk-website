import { createContext, ReactNode, useContext } from "react";
import {
  ModalErrorContextType,
  useModalError,
} from "./modal/modal-error-context";
import { ModalInfoContextType, useModalInfo } from "./modal/modal-info-context";
import {
  ModalChoiceContextType,
  useModalChoice,
} from "./modal/modal-choice-context";

export const ModalContext = createContext<
  ModalChoiceContextType & ModalErrorContextType & ModalInfoContextType
>({
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

export function ModalProvider({ children }: { children: ReactNode }) {
  const modalChoiceContext = useModalChoice();
  const modalErrorContext = useModalError();
  const modalInfoContext = useModalInfo();

  return (
    <ModalContext.Provider
      value={{
        ...modalChoiceContext,
        ...modalErrorContext,
        ...modalInfoContext,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
