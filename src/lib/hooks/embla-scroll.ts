import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useEffect, useState } from "react";

type EmblaApi = UseEmblaCarouselType[1];

export function useEmblaScroll(api: EmblaApi) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (api == null) {
      return;
    }
    const update = (api: Exclude<EmblaApi, undefined>) => {
      setProgress(api.scrollProgress());
    };

    update(api);
    api.on("scroll", update);

    return () => {
      api.off("scroll", update);
    };
  }, [api]);

  return progress;
}
