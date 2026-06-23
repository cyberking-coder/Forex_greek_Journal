"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * App-wide toast host. Themed to match the dark UI; mounted once in the root
 * layout. Emit toasts from anywhere via `toast` in "@/lib/toast".
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
        },
      }}
    />
  );
}
