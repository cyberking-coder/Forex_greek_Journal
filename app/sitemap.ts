import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Only public, indexable routes belong here. The app (/dashboard), per-user
 * share links (/share), and API routes are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/login"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/signup"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
