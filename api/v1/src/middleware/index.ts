import { authMiddleware } from "./auth";
import { headerMiddleware } from "./headers";
import { loggingMiddleware } from "./logging";

export default function getMiddleware() {
  return [loggingMiddleware, headerMiddleware, authMiddleware];
}
