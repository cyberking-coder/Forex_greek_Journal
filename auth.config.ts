import type { NextAuthConfig } from "next-auth";
// Type-only import — keeps @prisma/client out of the edge (middleware) runtime.
import type { Plan } from "@prisma/client";

/** Route prefixes that require an authenticated session (the (app) group). */
const PROTECTED_PREFIXES = ["/dashboard"];
/** Auth pages a logged-in user should be bounced away from. */
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Edge-safe NextAuth configuration shared between the middleware and the full
 * server config in `auth.ts`. It must not import Node-only code (Prisma,
 * bcrypt) so it can run in the middleware (edge) runtime.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  // Trust the deploying host (set behind a known proxy/origin). Required in
  // production; dev trusts localhost automatically.
  trustHost: true,
  // Providers are registered in auth.ts (they need Prisma/bcrypt).
  providers: [],
  callbacks: {
    // Drives middleware protection: return false to redirect to signIn page.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      );
      if (isProtected) return isLoggedIn;

      if (isLoggedIn && AUTH_PAGES.includes(pathname)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      // `token.sub` already carries the user id; we only stash the plan.
      if (user) token.plan = user.plan;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (token.plan) session.user.plan = token.plan as Plan;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
