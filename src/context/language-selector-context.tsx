"use client";

import {
  createContext,
  CSSProperties,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const LanguageSelectorContext = createContext<
  | {
      markerStyle: CSSProperties;
      updateMarkerStyle: () => void;
      selectedButtonRef: RefObject<HTMLAnchorElement | null>;
    }
  | undefined
>(undefined);

export function useLanguageSelector() {
  const context = useContext(LanguageSelectorContext);
  if (!context) {
    throw new Error(
      "useLanguageSelector must be used within a LanguageSelectorProvider.",
    );
  }
  return context;
}

export function LanguageSelectorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [markerStyle, setMarkerStyle] = useState<CSSProperties>({});
  const selectedButtonRef = useRef<HTMLAnchorElement>(null);

  function updateMarkerStyle() {
    const button = selectedButtonRef.current;
    setMarkerStyle({
      width: button?.offsetWidth,
      height: button?.offsetHeight,
      left: button?.offsetLeft,
      top: button?.offsetTop,
    });
  }

  useEffect(() => {
    window.addEventListener("resize", updateMarkerStyle);
    window.addEventListener("load", updateMarkerStyle);

    return () => {
      window.removeEventListener("resize", updateMarkerStyle);
      window.removeEventListener("load", updateMarkerStyle);
    };
  }, [selectedButtonRef]);

  return (
    <LanguageSelectorContext.Provider
      value={{ markerStyle, updateMarkerStyle, selectedButtonRef }}
    >
      {children}
    </LanguageSelectorContext.Provider>
  );
}
