"use client";

import { useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
import { contact } from "@/lib/marketing/content";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

type Status = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="py-24 sm:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: heading + contact methods */}
          <div>
            <SectionHeading
              eyebrow="Contact"
              title={contact.title}
              subtitle={contact.subtitle}
              align="left"
            />
            <div className="mt-8 space-y-4">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-muted transition-colors hover:text-foreground"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-accent">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                {contact.email}
              </a>
              <a
                href={contact.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted transition-colors hover:text-foreground"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-accent">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                {contact.whatsapp.label}
              </a>
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={handleSubmit}
            className="bg-surface/60 rounded-2xl border border-border p-6 sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" type="text" required />
              <Field label="Email" name="email" type="email" required />
            </div>
            <div className="mt-4">
              <label
                htmlFor="message"
                className="mb-1.5 block text-sm font-medium"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              aria-busy={status === "submitting"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden />
              {status === "submitting" ? "Sending..." : "Send Message"}
            </button>

            <div aria-live="polite" className="mt-3">
              {status === "success" && (
                <p className="text-sm text-emerald-400">
                  Thanks! We&apos;ll be in touch shortly.
                </p>
              )}
              {status === "error" && (
                <p role="alert" className="text-sm text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
      />
    </div>
  );
}
