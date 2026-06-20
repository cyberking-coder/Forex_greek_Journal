/**
 * Layout shell for authenticated application routes.
 * Marketing pages live in the (marketing) group and do not inherit this.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
