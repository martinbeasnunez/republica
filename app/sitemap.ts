import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { COUNTRIES } from "@/lib/config/countries";

const BASE_URL = "https://condorlatam.com";

const COUNTRY_CODES = Object.keys(COUNTRIES) as (keyof typeof COUNTRIES)[];

// Routes ordered by SEO priority (encuestas & candidatos are highest-traffic)
const SECTION_ROUTES = [
  { path: "", changeFrequency: "daily" as const, priority: 1.0 },
  { path: "/encuestas", changeFrequency: "daily" as const, priority: 0.95 },
  { path: "/candidatos", changeFrequency: "daily" as const, priority: 0.95 },
  { path: "/noticias", changeFrequency: "hourly" as const, priority: 0.9 },
  { path: "/verificador", changeFrequency: "daily" as const, priority: 0.85 },
  { path: "/quiz", changeFrequency: "weekly" as const, priority: 0.85 },
  { path: "/simulador", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/planes", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/candidatos/comparar", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/radiografia", changeFrequency: "weekly" as const, priority: 0.75 },
  { path: "/mapa", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/pilares", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/en-vivo", changeFrequency: "hourly" as const, priority: 0.7 },
  { path: "/actualizaciones", changeFrequency: "daily" as const, priority: 0.6 },
  { path: "/metodologia", changeFrequency: "monthly" as const, priority: 0.6 },
];

/**
 * Build hreflang alternates for a given path.
 * Google uses these to show the right country version in search results.
 */
function buildAlternates(path: string): MetadataRoute.Sitemap[number]["alternates"] {
  return {
    languages: {
      "es-PE": `${BASE_URL}/pe${path}`,
      "es-CO": `${BASE_URL}/co${path}`,
      "x-default": `${BASE_URL}/pe${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Root (country selector) ──────────────────────────
  const rootRoute: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          "es-PE": `${BASE_URL}/pe`,
          "es-CO": `${BASE_URL}/co`,
          "x-default": `${BASE_URL}`,
        },
      },
    },
  ];

  // ─── Static routes per country (with hreflang alternates) ──
  const staticRoutes: MetadataRoute.Sitemap = COUNTRY_CODES.flatMap((cc) =>
    SECTION_ROUTES.map((route) => ({
      url: `${BASE_URL}/${cc}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: buildAlternates(route.path),
    }))
  );

  // ─── Dynamic candidate routes per country ───────────────
  let candidateRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabase();
    const { data: candidates } = await supabase
      .from("candidates")
      .select("slug, id, country_code")
      .eq("is_active", true);

    if (candidates) {
      candidateRoutes = candidates.flatMap((c) => [
        {
          url: `${BASE_URL}/${c.country_code}/candidatos/${c.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.85,
        },
        {
          url: `${BASE_URL}/${c.country_code}/radiografia/${c.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ]);
    }
  } catch (err) {
    console.error("[sitemap] Error fetching candidates:", err);
  }

  return [...rootRoute, ...staticRoutes, ...candidateRoutes];
}
