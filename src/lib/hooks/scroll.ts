import { useEffect, useState } from "react";

export function useScroll() {
  const [scroll, setScroll] = useState({ scrollY: 0 });

  function handleScroll() {
    setScroll({ scrollY: window.scrollY });
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scroll;
}
