import Link from "next/link";
import { LineChart } from "lucide-react";
import { brand, footer } from "@/lib/marketing/content";
import { Container } from "./Container";

/** Minimal inline brand glyphs so we don't depend on deprecated icon sets. */
function SocialIcon({ name }: { name: string }) {
  const common = "h-5 w-5";
  switch (name) {
    case "twitter":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={common}
          aria-hidden
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
      );
    case "discord":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={common}
          aria-hidden
        >
          <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.21.375-.45.88-.617 1.28a18.27 18.27 0 0 0-5.535 0A12.6 12.6 0 0 0 9.11 3 19.74 19.74 0 0 0 4.677 4.37C1.86 8.59 1.1 12.7 1.48 16.76a19.9 19.9 0 0 0 6.073 3.07c.49-.67.927-1.38 1.304-2.13-.718-.27-1.404-.604-2.05-.996.172-.126.34-.258.503-.39a14.2 14.2 0 0 0 12.18 0c.165.135.333.267.502.39-.647.393-1.335.728-2.053.997.377.75.813 1.46 1.303 2.13a19.84 19.84 0 0 0 6.075-3.07c.448-4.71-.764-8.79-3.2-12.39ZM8.02 14.26c-1.18 0-2.156-1.09-2.156-2.42 0-1.33.955-2.42 2.156-2.42 1.21 0 2.176 1.1 2.156 2.42 0 1.33-.955 2.42-2.156 2.42Zm7.96 0c-1.18 0-2.156-1.09-2.156-2.42 0-1.33.955-2.42 2.156-2.42 1.21 0 2.176 1.1 2.156 2.42 0 1.33-.946 2.42-2.156 2.42Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={common}
          aria-hidden
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.546 15.568V8.432L15.818 12l-6.272 3.568Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  return (
    <footer className="border-border/60 border-t bg-background">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="bg-accent/15 flex h-8 w-8 items-center justify-center rounded-lg text-accent">
                <LineChart className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-lg tracking-tight">{brand.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {footer.description}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {footer.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="hover:border-accent/50 flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-foreground"
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold">{col.title}</h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border/60 mt-12 border-t pt-8 text-sm text-muted">
          {footer.copyright}
        </div>
      </Container>
    </footer>
  );
}
