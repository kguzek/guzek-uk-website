"use client";

import { getCache } from "@/lib/backend";
import { StateSetter, User } from "@/lib/models";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslations } from "./translation-context";
import { getLocalUser } from "@/lib/util";
import { useModalInfo } from "./modal/modal-info-context";

export interface AuthInfo {
  user: User | null | undefined;
  setUser: StateSetter<User | null | undefined>;
  logout: () => void;
}

export const AuthContext = createContext<AuthInfo>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined
  );
  const { data } = useTranslations();
  const { setModalInfo } = useModalInfo();

  useEffect(() => {
    const localUser = getLocalUser();
    if (currentUser) {
      if (!localUser) {
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } else if (localUser) {
      setCurrentUser(localUser);
    }
  }, [currentUser]);

  async function clearPersonalCachedResponses() {
    const cache = await getCache();
    if (!cache) return;
    const cachedResponses = await cache.matchAll();
    for (const res of cachedResponses) {
      if (/\/personal\/?[^\/]*$/.test(res.url)) await cache.delete(res.url);
    }
  }

  function logout() {
    setCurrentUser(null);
    setModalInfo(data.loggedOut);
    clearPersonalCachedResponses();
  }

  const auth: AuthInfo = {
    user: currentUser,
    setUser: setCurrentUser,
    logout,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
