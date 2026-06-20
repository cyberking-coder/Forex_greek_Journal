import type { Metadata } from "next";
import { fontSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forex Greek Journal",
  description: "A trading journal for forex traders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontSans.variable} dark`}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
