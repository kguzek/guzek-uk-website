import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

import { getAuthBase } from ".";

/** Retrieves the access token from cookies and decodes the payload into a user object. */
export async function getAuth() {
  const cookieStore = await cookies();
  const payload = await getPayload({ config });
  const { user, accessToken } = await getAuthBase(cookieStore);
  if (user == null) {
    return { user: null, accessToken: null };
  }
  return {
    user: await payload.findByID({
      collection: "users",
      id: user.id,
    }),
    accessToken,
  };
}
