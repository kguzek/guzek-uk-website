import type { RefObject } from "react";
import { useEffect, useState } from "react";

export function useElementScroll(ref: RefObject<HTMLElement | null>) {
  const [scroll, setScroll] = useState(0);
  const [totalWidth, setTotalWidth] = useState(1);
  const [visibleWidth, setVisibleWidth] = useState(1);

  function handleScroll() {
    const elem = ref.current;
    setScroll(elem?.scrollLeft ?? 0);
    setTotalWidth(elem?.scrollWidth || 1);
    // TODO: maybe this should be .offsetWidth?
    setVisibleWidth(elem?.clientWidth || 1);
  }

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    element.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    handleScroll();

    return () => {
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [ref.current]);

  return { scroll, totalWidth, visibleWidth };
}
