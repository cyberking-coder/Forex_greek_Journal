import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

/** Shared call-to-action link, styled as a button. */
export function CtaButton({
  href,
  children,
  variant = "primary",
  className,
}: CtaButtonProps) {
  const external = href.startsWith("http");
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent-hover"
      : "border border-border bg-surface text-foreground hover:border-accent/50 hover:bg-surface-elevated";

  return (
    <Link
      href={href}
      className={cn(base, styles, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}
