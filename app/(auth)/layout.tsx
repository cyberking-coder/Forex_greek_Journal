import type { Metadata } from "next";

/** Auth pages shouldn't be indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Bare layout for auth pages — no marketing nav or footer. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="main-content" className="min-h-screen bg-background">
      {children}
    </div>
  );
}
