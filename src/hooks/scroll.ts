import { useEffect, useState } from "react";

export function useScroll(element: Element | null) {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    if (!element) return;
    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [element]);

  function handleScroll(scrollEvent: Event) {
    const elem = scrollEvent.target as Element | null;
    setScroll(elem?.scrollLeft ?? 0);
  }

  return { scroll };
}
