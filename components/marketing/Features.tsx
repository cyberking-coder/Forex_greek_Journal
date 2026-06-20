import { Check } from "lucide-react";
import { features, type FeatureItem } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { PlaceholderImage } from "./PlaceholderImage";

function FeatureRow({
  item,
  reversed,
}: {
  item: FeatureItem;
  reversed: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Text */}
      <div className={cn(reversed && "lg:order-2")}>
        <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {item.title}
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {item.description}
        </p>
        <ul className="mt-6 space-y-3">
          {item.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className="bg-accent/15 mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-accent">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-foreground">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Image */}
      <div className={cn(reversed && "lg:order-1")}>
        <PlaceholderImage label={item.imageLabel} />
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title={features.title}
          subtitle={features.subtitle}
        />

        <div className="mt-20 space-y-24">
          {features.items.map((item, i) => (
            <FeatureRow key={item.title} item={item} reversed={i % 2 === 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}
