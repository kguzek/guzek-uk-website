import { cookies } from "next/headers";
import { refreshAccessToken } from "@/lib/backend-v2";
import type { User } from "@/lib/types";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const value = cookieStore.get("user")?.value;
  if (!value) {
    const { user } = await refreshAccessToken();
    return user;
  }
  try {
    return JSON.parse(value) as User;
  } catch (error) {
    console.error("Error parsing user cookie", error);
    return null;
  }
}

export async function useAuth() {
  const user = await getCurrentUser();
  return { user };
}
