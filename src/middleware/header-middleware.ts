import { MiddlewareFactory } from "@/lib/types";

export const headerMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const response = await next(request);
    response.headers.set(
      "Onion-Location",
      "http://guzekchh4j7gecly46ipa5vap2g6plfw5akf44xjuonyo3h7ppq7ntyd.onion",
    );
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
    return response;
  };
