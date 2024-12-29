import { createContext, ReactNode, useContext, useState } from "react";
import Modal from "@/components/modal/modal";

export type ModalInfoContextType = {
  modalInfo: string | undefined;
  setModalInfo: (message?: string) => void;
};

const ModalInfoContext = createContext<ModalInfoContextType>({
  modalInfo: undefined,
  setModalInfo: () => {},
});

export function useModalInfo() {
  const context = useContext(ModalInfoContext);
  if (!context) {
    throw new Error("useModalInfo must be used within a ModalProvider.");
  }
  return context;
}

export function ModalInfoProvider({ children }: { children: ReactNode }) {
  const [modalInfo, setModalInfo] = useState<string | undefined>();

  return (
    <ModalInfoContext.Provider value={{ modalInfo, setModalInfo }}>
      <Modal value={modalInfo} onClick={() => setModalInfo("")} />
      {children}
    </ModalInfoContext.Provider>
  );
}
