"use client";

import { useState } from "react";
import Link from "next/link";
import { LineChart, Menu, X } from "lucide-react";
import { brand, nav } from "@/lib/marketing/content";
import { CtaButton } from "./CtaButton";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <nav className="container-marketing flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-accent/15 flex h-8 w-8 items-center justify-center rounded-lg text-accent">
            <LineChart className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg tracking-tight">{brand.name}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {nav.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <CtaButton href={nav.cta.href}>{nav.cta.label}</CtaButton>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-border/60 border-t bg-background md:hidden">
          <div className="container-marketing flex flex-col gap-1 py-4">
            {nav.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <CtaButton href={nav.cta.href} className="mt-2 w-full">
              {nav.cta.label}
            </CtaButton>
          </div>
        </div>
      )}
    </header>
  );
}
