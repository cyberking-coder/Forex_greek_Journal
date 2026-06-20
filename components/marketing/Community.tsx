import { Check } from "lucide-react";
import { community } from "@/lib/marketing/content";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { PlaceholderImage } from "./PlaceholderImage";

export function Community() {
  return (
    <section id="community" className="relative py-24 sm:py-32">
      {/* Subtle section glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-accent/10 absolute left-1/2 top-1/3 h-96 w-[36rem] -translate-x-1/2 rounded-full blur-[120px]" />
      </div>

      <Container>
        <SectionHeading
          eyebrow="Community"
          title={community.title}
          subtitle={community.subtitle}
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {community.blocks.map((block) => (
            <div
              key={block.title}
              className="bg-surface/60 flex flex-col gap-6 rounded-2xl border border-border p-6 sm:p-8"
            >
              <PlaceholderImage
                label={block.imageLabel}
                aspect="aspect-[16/9]"
              />
              <div>
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {block.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">
                  {block.description}
                </p>
                <ul className="mt-5 space-y-3">
                  {block.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="bg-accent/15 mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-accent">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="text-foreground">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
