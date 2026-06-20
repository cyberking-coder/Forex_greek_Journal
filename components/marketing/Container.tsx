import { cn } from "@/lib/utils";

/** Centered content column shared across marketing sections. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("container-marketing", className)}>{children}</div>;
}
