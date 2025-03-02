import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

import { getAuthFromCookies } from "./cookies";

/** Retrieves the access token from cookies and decodes the payload into a user object. */
export async function getAuth() {
  const cookieStore = await cookies();
  const payload = await getPayload({ config });
  const { user, accessToken } = await getAuthFromCookies(cookieStore);
  if (user == null) {
    return { user: null, accessToken: null };
  }
  let payloadUser;
  try {
    payloadUser = await payload.findByID({
      collection: "users",
      id: user.id,
    });
  } catch (error) {
    console.warn("Error fetching user from payload", error);
    return { user: null, accessToken: null };
  }
  return {
    user: payloadUser,
    accessToken,
  };
}
