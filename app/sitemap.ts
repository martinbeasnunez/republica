import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { COUNTRIES } from "@/lib/config/countries";

const BASE_URL = "https://condorperu.vercel.app";

const COUNTRY_CODES = Object.keys(COUNTRIES) as (keyof typeof COUNTRIES)[];

const SECTION_ROUTES = [
  { path: "", changeFrequency: "daily" as const, priority: 1.0 },
  { path: "/candidatos", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/encuestas", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/noticias", changeFrequency: "hourly" as const, priority: 0.9 },
  { path: "/verificador", changeFrequency: "daily" as const, priority: 0.8 },
  { path: "/planes", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/quiz", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/mapa", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/en-vivo", changeFrequency: "hourly" as const, priority: 0.7 },
  { path: "/radiografia", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/actualizaciones", changeFrequency: "daily" as const, priority: 0.7 },
  { path: "/pilares", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/simulador", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/metodologia", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/candidatos/comparar", changeFrequency: "weekly" as const, priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Root ─────────────────────────────────────────────
  const rootRoute: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // ─── Static routes per country ────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = COUNTRY_CODES.flatMap((cc) =>
    SECTION_ROUTES.map((route) => ({
      url: `${BASE_URL}/${cc}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  );

  // ─── Dynamic candidate routes per country ─────────────
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
