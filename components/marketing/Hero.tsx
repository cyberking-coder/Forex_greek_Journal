import { ArrowRight, TrendingUp } from "lucide-react";
import { hero } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { CtaButton } from "./CtaButton";
import { PlaceholderImage } from "./PlaceholderImage";

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-accent to-sky-600 text-xs font-semibold text-white"
      title={name}
    >
      {initials}
    </span>
  );
}

function StatCard({
  label,
  value,
  delta,
  positive,
  className,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface-elevated/95 rounded-xl border border-border p-4 shadow-2xl shadow-black/50 backdrop-blur",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p
        className={cn(
          "mt-0.5 flex items-center gap-1 text-xs font-medium",
          positive ? "text-emerald-400" : "text-muted",
        )}
      >
        {positive && <TrendingUp className="h-3.5 w-3.5" aria-hidden />}
        {delta}
      </p>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-20 sm:pb-32 sm:pt-28">
      {/* Cinematic background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-accent/15 absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-[100px]" />
      </div>

      <Container className="flex flex-col items-center text-center">
        <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Track Trades. Analyze PnL.{" "}
          <span className="text-gradient-accent">Master Markets.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted sm:text-xl">
          {hero.subline}
        </p>

        <div className="mt-8">
          <CtaButton href={hero.cta.href} className="px-6 py-3 text-base">
            {hero.cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </CtaButton>
        </div>

        {/* Reviewer avatars + quotes */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex -space-x-2">
            {hero.reviewers.map((r) => (
              <Avatar key={r.name} name={r.name} />
            ))}
          </div>
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">
              {hero.reviewSummary}
            </span>{" "}
            — &ldquo;{hero.reviewers[0].quote}&rdquo;
          </p>
        </div>

        {/* Dashboard screenshot + floating stat cards */}
        <div className="relative mt-16 w-full max-w-5xl">
          <PlaceholderImage label="Product Dashboard" aspect="aspect-[16/9]" />

          <StatCard
            {...hero.stats[0]}
            className="absolute -left-4 top-10 w-44 sm:-left-8 md:-left-12"
          />
          <StatCard
            {...hero.stats[1]}
            className="absolute -right-4 bottom-10 w-44 sm:-right-8 md:-right-12"
          />
        </div>
      </Container>
    </section>
  );
}
