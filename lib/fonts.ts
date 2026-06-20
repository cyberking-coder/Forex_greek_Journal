import { Inter } from "next/font/google";

/**
 * Application typefaces, loaded via next/font for zero layout shift and
 * self-hosting. The CSS variable is consumed by Tailwind's `font-sans`.
 */
export const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
