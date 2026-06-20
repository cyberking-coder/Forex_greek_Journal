import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Edge-safe middleware: the `authorized` callback in authConfig decides access.
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
