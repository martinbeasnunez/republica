import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

const BASE_URL = "https://condorperu.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Static routes ─────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/candidatos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/encuestas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/noticias`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/verificador`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/planes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/mapa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en-vivo`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/radiografia`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/actualizaciones`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pilares`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/simulador`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/metodologia`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/candidatos/comparar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // ─── Dynamic candidate routes ──────────────────────────
  let candidateRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabase();
    const { data: candidates } = await supabase
      .from("candidates")
      .select("slug, id")
      .eq("is_active", true);

    if (candidates) {
      candidateRoutes = candidates.flatMap((c) => [
        {
          url: `${BASE_URL}/candidatos/${c.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.85,
        },
        {
          url: `${BASE_URL}/radiografia/${c.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ]);
    }
  } catch (err) {
    console.error("[sitemap] Error fetching candidates:", err);
    // Fallback to seed slugs
    const seedSlugs = [
      "rafael-lopez-aliaga",
      "keiko-fujimori",
      "carlos-alvarez",
      "george-forsyth",
      "jose-lopez-chau",
      "cesar-acuna",
      "hernando-de-soto",
      "daniel-urresti",
    ];
    candidateRoutes = seedSlugs.map((slug) => ({
      url: `${BASE_URL}/candidatos/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
  }

  return [...staticRoutes, ...candidateRoutes];
}
