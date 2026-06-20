"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faq } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

function FaqRow({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium sm:text-lg">{question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-none text-muted transition-transform duration-200",
            open && "rotate-180 text-accent",
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="leading-relaxed text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title={faq.title}
          subtitle={faq.subtitle}
        />

        <div className="mx-auto mt-12 max-w-3xl">
          {faq.items.map((item, i) => (
            <FaqRow
              key={item.question}
              question={item.question}
              answer={item.answer}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
