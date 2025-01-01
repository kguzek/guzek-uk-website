import { RefObject, useEffect, useState } from "react";

export function useScroll(ref: RefObject<HTMLElement | null>) {
  const [scroll, setScroll] = useState(0);
  const [totalWidth, setTotalWidth] = useState(1);
  const [visibleWidth, setVisibleWidth] = useState(1);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [ref.current]);

  function handleScroll(scrollEvent: Event) {
    const elem = scrollEvent.target as Element | null;
    setScroll(elem?.scrollLeft ?? 0);
    setTotalWidth(elem?.scrollWidth ?? 1);
    // TODO: maybe this should be .offsetWidth?
    setVisibleWidth(elem?.clientWidth ?? 1);
  }

  return { scroll, totalWidth, visibleWidth };
}
