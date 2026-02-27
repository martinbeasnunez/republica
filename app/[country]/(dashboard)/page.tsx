import type { Metadata } from "next";
import { fetchCandidates, fetchTopCandidates } from "@/lib/data/candidates";
import { fetchArticles } from "@/lib/data/news";
import { fetchFactChecks } from "@/lib/data/fact-checks";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { getSupabase } from "@/lib/supabase";
import HomeClient from "./home-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country);

  return {
    title: `Elecciones ${seo.name} ${seo.year} — Candidatos, Encuestas y Noticias`,
    description: `Resumen rápido elecciones ${seo.name} ${seo.year}. ¿Quién va ganando? Conoce a los candidatos, mira las encuestas y descubre por quién votar. Información verificada con IA.`,
    keywords: getCountryKeywords(country, "home"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Elecciones ${seo.name} ${seo.year} — Candidatos, Encuestas y Noticias`,
      description: `¿Quién va ganando? Conoce a los candidatos, mira las encuestas y descubre por quién votar. CONDOR — Inteligencia Electoral.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

// ── Briefing type (matches brain_briefings table) ──
export interface PublicBriefing {
  editorial_summary: string;
  briefing_date: string;
  top_stories: Array<{
    title: string;
    summary: string;
    source: string;
    impact_score: number;
  }>;
}

async function fetchLatestBriefing(country: string): Promise<PublicBriefing | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("brain_briefings")
      .select("editorial_summary, briefing_date, top_stories")
      .eq("country_code", country)
      .order("briefing_date", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return null;
    return data[0] as PublicBriefing;
  } catch {
    return null;
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;

  const [candidates, topCandidates, articles, factChecks, briefing] = await Promise.all([
    fetchCandidates(country),
    fetchTopCandidates(5, country),
    fetchArticles(country),
    fetchFactChecks(10, country),
    fetchLatestBriefing(country),
  ]);

  return (
    <HomeClient
      candidates={candidates}
      topCandidates={topCandidates}
      articles={articles}
      factChecks={factChecks}
      briefing={briefing}
    />
  );
}
