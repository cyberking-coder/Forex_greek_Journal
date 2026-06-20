import Link from "next/link";
import { LineChart } from "lucide-react";

/** Centered card used by the login and signup pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      {/* Cinematic glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-accent/15 absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-semibold"
        >
          <span className="bg-accent/15 flex h-8 w-8 items-center justify-center rounded-lg text-accent">
            <LineChart className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg tracking-tight">Greek Journal</span>
        </Link>

        <div className="bg-surface/60 rounded-2xl border border-border p-6 shadow-2xl shadow-black/40 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}
