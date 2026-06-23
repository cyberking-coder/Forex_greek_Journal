import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the authenticated app, per-user share links, and API out of search.
      disallow: ["/dashboard", "/api", "/share"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(),
  };
}
