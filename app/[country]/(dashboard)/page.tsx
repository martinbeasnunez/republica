import type { Metadata } from "next";
import { fetchCandidates, fetchTopCandidates } from "@/lib/data/candidates";
import { fetchArticles } from "@/lib/data/news";
import { fetchFactChecks } from "@/lib/data/fact-checks";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { getSupabase } from "@/lib/supabase";
import HomeClient from "./home-client";
import { EnVivoClient } from "./en-vivo/en-vivo-client";
import type { HomepageBlock } from "@/lib/types/homepage-blocks";
import { getActiveEvent, getNextEvent, getRecentEvent, getUpcomingEvents, getCountryConfig, type CountryCode } from "@/lib/config/countries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const countryCode = country as CountryCode;
  const seo = getCountrySeo(country);

  if (shouldUseLiveHome(countryCode)) {
    return {
      title: `Resultados en Vivo — Elecciones ${seo.name} ${seo.year}`,
      description: `Seguimiento en vivo de las elecciones ${seo.name} ${seo.year}. Resultados oficiales, conteo de votos y cobertura en tiempo real.`,
      keywords: getCountryKeywords(country, "en-vivo"),
      alternates: seo.alternates,
      openGraph: {
        ...seo.openGraph,
        title: `Resultados en Vivo — Elecciones ${seo.name} ${seo.year}`,
        description: `Cobertura en tiempo real de las elecciones ${seo.name} ${seo.year}. CONDOR — Inteligencia Electoral.`,
        type: "website",
      },
    };
  }

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
  poll_movements?: Array<{
    candidate: string;
    previous: number;
    current: number;
    direction: "up" | "down" | "stable";
  }>;
  /** AI-generated key takeaways (on election day: 5 insights for each category) */
  key_takeaways?: string[];
  /** Parsed timeline entries from live news coverage */
  timeline?: Array<{ time: string; text: string; source: string }>;
  /** How many hours ago the briefing was generated */
  _ageHours?: number;
  /** Whether the briefing is from today */
  _isToday?: boolean;
}

async function fetchLatestBriefing(country: string): Promise<PublicBriefing | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("brain_briefings")
      .select("editorial_summary, briefing_date, top_stories, poll_movements, health_status")
      .eq("country_code", country)
      .order("briefing_date", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return null;

    const row = data[0];
    const briefing = row as PublicBriefing;
    // Extract key_takeaways from health_status (stored there on election day)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const healthStatus = (row as any).health_status;
    if (healthStatus?.key_takeaways) {
      briefing.key_takeaways = healthStatus.key_takeaways;
    }
    if (healthStatus?.timeline) {
      briefing.timeline = healthStatus.timeline;
    }

    // Compute staleness metadata
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const briefingDate = new Date(briefing.briefing_date + "T12:00:00");
    const ageMs = now.getTime() - briefingDate.getTime();
    briefing._ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    briefing._isToday = briefing.briefing_date === todayStr;

    return briefing;
  } catch {
    return null;
  }
}

async function fetchHomepageBlocks(country: string): Promise<HomepageBlock[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("homepage_blocks")
      .select("id, country_code, block_type, position, title, subtitle, content, click_count, is_active, created_at, expires_at")
      .eq("country_code", country)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("position", { ascending: true })
      .limit(6);

    return (data as HomepageBlock[]) || [];
  } catch {
    return [];
  }
}

// Check if we're in the post-election results window for a country
// Window: election day + 7 days (while ONPE count is still in progress)
function isElectionWindow(countryCode: CountryCode): boolean {
  const config = getCountryConfig(countryCode);
  if (!config) return false;
  const tz = countryCode === "pe" ? "America/Lima" : "America/Bogota";
  const localDate = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const electionDate = new Date(config.electionDate + "T12:00:00");
  const localDateObj = new Date(localDate + "T12:00:00");
  const daysDiff = Math.floor((localDateObj.getTime() - electionDate.getTime()) / 86400000);
  return daysDiff >= 0 && daysDiff <= 7;
}

function shouldUseLiveHome(countryCode: CountryCode): boolean {
  if (countryCode === "pe") return true;
  return isElectionWindow(countryCode);
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const countryCode = country as CountryCode;

  // Live mode: show full coverage hub as homepage.
  // - Any country, during the election-week window (election day + 7d).
  // - Peru permanently from first round through second round + 7d.
  if (shouldUseLiveHome(countryCode)) {
    const [candidates, topCandidates, articles, factChecks, briefing, homepageBlocks] = await Promise.all([
      fetchCandidates(country),
      fetchTopCandidates(8, country),
      fetchArticles(country),
      fetchFactChecks(200, country),
      fetchLatestBriefing(country),
      fetchHomepageBlocks(country),
    ]);
    const activeEvent = getActiveEvent(countryCode);
    const nextEvent = getNextEvent(countryCode);
    const upcomingEvents = getUpcomingEvents(countryCode);

    return (
      <EnVivoClient
        candidates={candidates}
        topCandidates={topCandidates}
        articles={articles}
        factChecks={factChecks}
        briefing={briefing}
        homepageBlocks={homepageBlocks}
        activeEvent={activeEvent}
        nextEvent={nextEvent}
        upcomingEvents={upcomingEvents}
      />
    );
  }

  const [candidates, topCandidates, articles, factChecks, briefing, homepageBlocks] = await Promise.all([
    fetchCandidates(country),
    fetchTopCandidates(5, country),
    fetchArticles(country),
    fetchFactChecks(200, country),
    fetchLatestBriefing(country),
    fetchHomepageBlocks(country),
  ]);

  const activeEvent = getActiveEvent(countryCode);
  const nextEvent = getNextEvent(countryCode);
  const recentEvent = getRecentEvent(countryCode);

  return (
    <HomeClient
      candidates={candidates}
      topCandidates={topCandidates}
      articles={articles}
      factChecks={factChecks}
      briefing={briefing}
      homepageBlocks={homepageBlocks}
      activeEvent={activeEvent}
      nextEvent={nextEvent}
      recentEvent={recentEvent}
    />
  );
}
