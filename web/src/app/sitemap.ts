import type { MetadataRoute } from "next";
import { LEGAL_SLUGS } from "@/lib/legal/documents";

const BASE_URL = "https://whobreystudios.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const legalPages: MetadataRoute.Sitemap = LEGAL_SLUGS.map((slug) => ({
    url: `${BASE_URL}/legal/${slug}`,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/services`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects/new`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...legalPages,
  ];
}
