import type { Session } from "next-auth";
import { auth } from "@/auth";

export { auth, signIn, signOut } from "@/auth";

/** Returns the current session, or null when signed out. */
export async function getSession(): Promise<Session | null> {
  return auth();
}

/** Returns the current user, or null when signed out. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
