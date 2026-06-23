import type { Metadata } from "next";

/** The authenticated app is private — keep it out of search indexes. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Layout shell for authenticated application routes.
 * Marketing pages live in the (marketing) group and do not inherit this.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="main-content" className="min-h-screen bg-background">
      {children}
    </div>
  );
}
