import type { MetadataRoute } from "next";

import { appConfig } from "@/config/app.config";

/**
 * Public marketing sitemap for Version 1.0.0 production discovery.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = appConfig.url.replace(/\/$/, "");
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
