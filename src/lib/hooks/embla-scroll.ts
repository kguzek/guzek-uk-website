import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useEffect, useState } from "react";

type EmblaApi = UseEmblaCarouselType[1];
type Api = Exclude<EmblaApi, undefined>;

export function useEmblaScroll(api: EmblaApi) {
  const [state, setState] = useState({ progress: 0, total: 1 });

  const updateProgress = (api: Api) => {
    setState((prev) => ({ ...prev, progress: api.scrollProgress() }));
  };

  const updateTotal = (api: Api) => {
    setState((prev) => ({ ...prev, total: api.slideNodes().length || 1 }));
  };

  const update = (api: Api) => {
    updateTotal(api);
    updateProgress(api);
  };

  useEffect(() => {
    if (api == null) {
      return;
    }

    api.on("scroll", updateProgress);
    api.on("init", update);

    return () => {
      api.off("scroll", updateProgress);
      api.off("init", update);
    };
  }, [api]);

  return state;
}
