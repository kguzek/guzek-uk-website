import { MiddlewareFactory } from "@/lib/types";

export const headerMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const response = await next(request);
    response.headers.set(
      "Onion-Location",
      "http://guzekchh4j7gecly46ipa5vap2g6plfw5akf44xjuonyo3h7ppq7ntyd.onion",
    );
    return response;
  };
