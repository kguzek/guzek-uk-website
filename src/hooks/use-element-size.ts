import { useCallback, useState } from "react";

export function useElementSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
