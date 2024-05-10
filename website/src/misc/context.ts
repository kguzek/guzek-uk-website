import { createContext, useContext } from "react";
import { Fetch } from "./backend";
import { StateSetter, User } from "./models";
import { Translation, TRANSLATIONS } from "./translations";

export interface Auth {
  user: User | null;
  setUser: StateSetter<User | null>;
  logout: () => void;
}

export const AuthContext = createContext<Auth>({
  user: null,
  setUser: () => {},
  logout: () => {},
});
export const FetchContext = createContext<Fetch | undefined>(undefined);

export function useFetchContext() {
  const fetchContext = useContext(FetchContext);
  if (!fetchContext) {
    throw new Error("FetchContext.Provider was not set in App.tsx");
  }
  return fetchContext;
}

export interface ModalContextObject {
  setModalInfo: (message?: string) => void;
  setModalError: (message?: string) => void;
  setModalChoice: (message?: string) => Promise<boolean>;
}

export const ModalContext = createContext<ModalContextObject>({
  setModalInfo: () => {},
  setModalError: () => {},
  setModalChoice: async () => false,
});

export const TranslationContext = createContext<Translation>(TRANSLATIONS.EN);

