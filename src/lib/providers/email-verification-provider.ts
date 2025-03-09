import { cookies } from "next/headers";

import { EMAIL_VERIFICATION_COOKIE } from "../constants";

export async function getPendingEmailAddress() {
  const cookieStore = await cookies();
  return cookieStore.get(EMAIL_VERIFICATION_COOKIE)?.value;
}
